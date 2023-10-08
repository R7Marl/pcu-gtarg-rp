const router = require('express').Router()
const { isLoggedIn } = require('../../lib/auth');
const pool = require('../../lib/database');
const { createPayment } = require('../../lib/sPagos');
const { generateUniqueToken, generatePaypalInvoice } = require('../../lib/pagosSecurity');
const mercadopago = require('mercadopago');
const paypal = require('paypal-rest-sdk'); // Importa el paquete de PayPal

// Configura PayPal directamente en tu archivo de rutas
paypal.configure({
  mode: 'live', // Cambiar a 'live' en producción
  client_id: 'AbLwnS5M0VP_doOlViyd-b6s7CgOTRAEIqVzsokljKHWT6_N5_znfrwp8rYsc0NpQD7dPdG0ciAjrs4j',
  client_secret: 'ED4c_fimuWe11v4b_xKW7MBG7a7AqPdfwbihMYfB9TB8x98b1_S1F5Tvoyiwew4bTAEHNOXBDVw3peH1',
});
router.get('/home', isLoggedIn, async (req, res) => {
    let rows = await pool.query('SELECT * FROM characters WHERE userID = ?', [req.user.userID])
    let numberCuentas = await pool.query('SELECT COUNT(*) as cuentas FROM wcf1_user;');
    let numberCharacters = await pool.query('SELECT COUNT(*) as characters FROM characters;');
    if(rows.length > 0){
        res.render('home', {
            personajes: rows,
            cuentas: numberCuentas[0].cuentas,
            characters: numberCharacters[0].characters
        })
    } else {
        res.render('home.hbs', {
            personajes: 0
        })
    }
});

router.get('/character/:id', isLoggedIn, async(req, res) => {
    let id = req.params.id;
    let rows = await pool.query('SELECT * FROM characters WHERE characterID = ? AND userID = ?', [id, req.user.userID]);

    if(rows.length > 0) {
        let autos = await pool.query('SELECT * FROM vehicles WHERE characterID = ?', [id]);
        let faction = await pool.query('SELECT * FROM character_to_factions WHERE characterID = ?', [id]);

        res.render('character', {
            personaje: rows[0],
            autos: autos,
            faction: faction || 'No estás en una facción.',
            nobacoins: rows[0].cantidadCoins
        })
    } else {
        req.flash('message', 'Hubo un error.')
        res.redirect('/home');
    }
})
//character/{{personaje.characterID}}/newname

router.post('/character/:id/newname', isLoggedIn, async(req, res) => {
  let id = req.params.id;
  let rows = await pool.query('SELECT * FROM characters WHERE characterID = ?', [id]);
  if(rows.length > 0) {
    let coins = rows[0].cantidadCoins;
    if(coins >= 5) {
      const regex = /^[A-Za-z]+\s[A-Za-z]+$/;
      const isvalid = regex.test(req.body.nuevonombre)
      if(isvalid) {
        let validation = await pool.query('SELECT * FROM characters WHERE characterName = ?', [req.body.nuevonombre]);
        if(validation > 0) {
          req.flash('message', 'El nombre ya está en uso.');
          res.redirect('/character/'+id);
        } else {
          await pool.query('UPDATE characters SET characterName = ?, cantidadCoins = ? WHERE characterID = ?', [req.body.nuevonombre, coins - 5, id]);
          req.flash('success', 'Nombre cambiado con exito: '+req.body.nuevonombre);
          res.redirect('/character/'+id);
        }
      } else {
        req.flash('message', 'El nombre es INVALIDO.')
      }

    } else {
      req.flash('message', 'No tienes suficientes coins para cambiar el nombre.');
      res.redirect('/character/'+id);
    }
  }
})

/*       <option value="3">3 Coins (125,000)</option>
      <option value="5">5 Coins (350,000)</option>
    <option value="7">7 Coins (550,000)</option>
           <option value="10">10 Coins (750,000)</option>
                <option value="12">12 Coins (1,000,000)</option>
     <option value="15">15 Coins (1,750,000)</option>
      <option value="25">25 Coins (3,500,000)</option>
    <option value="50">50 Coins (8,000,000)</option>
  */

router.post('/character/:id/money', isLoggedIn, async(req, res) => {
    let id = req.params.id;
    let option = req.body.coinAmount;
  let options = [3, 5, 7, 10, 12, 15, 25, 50];
  let money = [125000, 350000, 750000, 1000000, 1750000, 3500000, 8000000];
  for(let i = 0; i < options.length; i++) {
    if(option == options[i]) {
      let rows = await pool.query('SELECT * FROM characters WHERE characterID = ?', [id]);
      if(rows.length > 0) {
        if(rows[0].cantidadCoins >= parseInt(option)) {
          let coins = rows[0].cantidadCoins - options[i];
          let dinner = rows[0].money;
          dinner += money[i];
          await pool.query('UPDATE characters SET cantidadCoins = ?, money = ? WHERE characterID = ?', [coins, dinner, id])
          req.flash('success', `Aumento de dinero exitoso. $${money[i]} ha sido sumado a tu dinero.`);
          res.redirect('/character/'+id);
          break;
        } else {
          req.flash('message', 'No tienes las suficientes coins.');
          res.redirect('/character/'+id);
          break;
        }
      }
    }
  }

})


/* GET SUcCESS */
router.get('/success', isLoggedIn, async (req, res) => {

    let token = req.query.external_reference;
    let status = req.query.collection_status;
    console.log(status)
    console.log(req.query.paymentId)
    if(req.query.collection_id) {
        if(status == 'approved') {
            let rows = await pool.query('SELECT * FROM facturas WHERE secretToken = ?', [token]);
            console.log(token)
            console.log(rows)
            if(rows.length > 0) {
                if(rows[0].estado == 'Aprobado' || rows[0].estado == 'Rechazado') return res.status(403).send('¿Qué intentas?');
                await pool.query('UPDATE facturas SET `estado` = ?, `IP` = ? WHERE secretToken = ?', ['Aprobado', req.ip, token]);
                let camp = await pool.query('SELECT * FROM characters WHERE characterID = ?', [rows[0].characterID]);
                let coinsNeto = camp[0].cantidadCoins + rows[0].coins;
                await pool.query('UPDATE characters SET `cantidadCoins` = ? WHERE characterID = ?', [coinsNeto, rows[0].characterID]);
                req.flash('success', `El pago por (${rows[0].coins}) coins fue aprobado, ya fueron sumadas a tu personaje.`);
                res.redirect('/home');
            } else {
              req.flash('message', `Hubo un error.`);
              res.redirect('/home');
            }
        } else {
           req.flash('message', `Hubo un error`);
            res.redirect('/home');
        }
    } else if(req.query.paymentId) {
        const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
  };

  paypal.payment.execute(paymentId, execute_payment_json, async(error, payment) => {
    if (error) {
      console.error(error);
      req.flash('success', `Pago Invalido`);
      res.redirect('/home');
    } else {
      console.log(payment);
      let paypalRows = await pool.query('SELECT * FROM facturas WHERE secretToken = ?', [payment.id])
      console.log(paypalRows)
      if(paypalRows.length > 0) {
        if(payment.state == 'approved') {
          await pool.query('UPDATE facturas SET `estado` = ?, `IP` = ? WHERE secretToken = ?', ['Aprobado', req.ip, payment.id]);
          let camp = await pool.query('SELECT * FROM characters WHERE characterID = ?', [paypalRows[0].characterID]);
          let coinsNeto = camp[0].cantidadCoins + paypalRows[0].coins;
          await pool.query('UPDATE characters SET `cantidadCoins` = ? WHERE characterID = ?', [coinsNeto, paypalRows[0].characterID]);
        } 
      } else {
        req.flash('message', 'Hubo un error al recibir el pago, comunicate con la administración.');
        res.redirect('/home');
      }
      req.flash('success', `El pago por ${paypalRows[0].coins} coins fue aprobado, ya fueron sumadas a tu personaje.`);
      res.redirect('/home');
    }
  });
    }
  


})

router.get('/cancel', isLoggedIn, async(req, res) => {
  req.flash('message', 'El Pago fue Cancelado, crea otro');
  res.redirect('/home')
})
/* POST */

router.post('/coins', isLoggedIn, async (req, res) => {
    let { nobacoins, idcharacter } = req.body;
    let c = await pool.query('SELECT * FROM characters WHERE userID = ? AND characterID = ?', [req.user.userID, idcharacter]);
    if(c.length > 0) {
      let precio = 466.6;
      let precioNeto = nobacoins * precio;
      console.log(precioNeto)
      if(nobacoins >= 10) {
          precioNeto -= precioNeto * 0.05;
      }
      console.log(req.body)
      if(req.body.comprar_mercadopago == '') {
          let token = await generateUniqueToken(req.user, idcharacter, nobacoins, precioNeto);
          console.log(token)
          const result = await mercadopago.preferences.create({
              items: [
                {
                  title: 'Vas a comprar '+nobacoins,
                  unit_price: parseInt(precioNeto),
                  currency_id: "ARS",
                  quantity: 1,
                },
              ],
              external_reference: token,
             // notification_url: "",
              back_urls: {
                success: "https://pcu.gtarg-rp.com/success",
                pending: "https://pcu.gtarg-rp.com/cancel",
                failure: "https://pcu.gtarg-rp.com/cancel",
              },
            });
            res.redirect(result.body.init_point)
      } else if(req.body.comprar_paypal == '') {
          let precioUSD = nobacoins;
          let precioNetoUSD = precioUSD;
          if (nobacoins >= 50) {
              precioNetoUSD -= precioUSD * 0.15; // Descuento del 15%
          } else if (nobacoins >= 30) {
              precioNetoUSD -= precioUSD * 0.10; // Descuento del 10%
          } else if (nobacoins >= 15) {
              precioNetoUSD -= precioUSD * 0.05; // Descuento del 5%
          }
          console.log("USD "+precioNetoUSD)
          const create_payment_json = {
              intent: 'sale',
              payer: {
                payment_method: 'paypal',
              },
              // Agrega detalles del artículo y el precio aquí
              transactions: [
                {
                  item_list: {
                    items: [
                      {
                        name: 'COINS GTARG: '+nobacoins,
                        price: precioNetoUSD,
                        currency: 'USD',
                        quantity: 1,
                      },
                    ],
                  },
                  amount: {
                    currency: 'USD',
                    total: precioNetoUSD, // Total del pago
                  },
                  description: 'Estás comprando COINS para GTARG, Total Coins: '+nobacoins,
                },
              ],
              redirect_urls: {
                return_url: 'https://pcu.gtarg-rp.com/success', // URL de éxito
                cancel_url: 'https://pcu.gtarg-rp.com/cancel',   // URL de cancelación
              },
            };
          
            paypal.payment.create(create_payment_json, async(error, payment) => {
              if (error) {
                throw error;
              } else {
                await generatePaypalInvoice(req.user, idcharacter, nobacoins, precioNetoUSD, payment.id);
                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                  }
                }
              }
            });
      }
     
    } else {
      req.flash('message', 'Selecciona un personaje que sea tuyo');
      res.redirect('/home')
    }
 
    
})


module.exports = router