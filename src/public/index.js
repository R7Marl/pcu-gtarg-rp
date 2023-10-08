document.addEventListener("DOMContentLoaded", function(event) {
   
    const showNavbar = (toggleId, navId, bodyId, headerId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    bodypd = document.getElementById(bodyId),
    headerpd = document.getElementById(headerId)
    
    // Validate that all variables exist
    if(toggle && nav && bodypd && headerpd){
    toggle.addEventListener('click', ()=>{
    // show navbar
    nav.classList.toggle('show')
    // change icon
    toggle.classList.toggle('bx-x')
    // add padding to body
    bodypd.classList.toggle('body-pd')
    // add padding to header
    headerpd.classList.toggle('body-pd')
    })
    }
    }
    
    showNavbar('header-toggle','nav-bar','body-pd','header')
    
    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')
    
    function colorLink(){
    if(linkColor){
    linkColor.forEach(l=> l.classList.remove('active'))
    this.classList.add('active')
    }
    }
    linkColor.forEach(l=> l.addEventListener('click', colorLink))
    
     // Your code to run since DOM is loaded and ready
     var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
const numberRange = document.getElementById('numberRange');

// Obtén el elemento donde mostrarás el número seleccionado
const selectedNumber = document.getElementById('selectedNumber');
const selecterNumber1 = document.getElementById('selectedNumber1');

// Agrega un evento de cambio a la barra de desplazamiento
numberRange.addEventListener('input', function() {
    // Actualiza el número seleccionado en el elemento de texto
    selectedNumber.textContent = this.value;
    selectedNumber1.textContent = this.value;
});

const checkbox = document.getElementById('checkbox');
const submitButton = document.getElementById('submitButton');
const submitButton1 = document.getElementById('submitButton1');
// Agrega un evento de cambio al checkbox
checkbox.addEventListener('change', function() {
    // Habilita o deshabilita el botón según el estado del checkbox
    submitButton.disabled = !this.checked;
    submitButton1.disabled = !this.checked;
});

// Función para abrir una pestaña específica

    });



    function openTab(tabName) {
      var i, tabcontent, tablinks;
    
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
      }
    
      tablinks = document.getElementsByClassName("tablink");
      for (i = 0; i < tablinks.length; i++) {
          tablinks[i].style.backgroundColor = ""; // Restablece el fondo de todos los botones
      }
    
      document.getElementById(tabName).style.display = "block";
      // Establece el fondo del botón activo a "red"
      for (i = 0; i < tablinks.length; i++) {
          if (tablinks[i].getAttribute("onclick") === `openTab('${tabName}')`) {
              tablinks[i].style.backgroundColor = "lightblue";
          }
      }
    }
    