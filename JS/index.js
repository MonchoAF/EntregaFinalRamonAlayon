fetch("./JS/productosPorMarca.json")
    .then((response) => response.json())
    .then((productosPorMarca) => {
        const marcaIngresada = document.getElementById('marca');
        const productoIngresado = document.getElementById('nombre-producto');
        const precioIngresado = document.getElementById('precio');
        const tabla = document.querySelector('#tabla-productos tbody');
        const precioTotal = document.getElementById('precio-Total');

        marcaIngresada.addEventListener('change', () => {
            const marcaSeleccionada = marcaIngresada.value;
            productoIngresado.innerHTML = '<option value="" disabled selected>Seleccionar producto</option>';
            if (marcaSeleccionada) {
                const productos = productosPorMarca[marcaSeleccionada];
                for (const [producto, precio] of Object.entries(productos)) {
                    const opcion = document.createElement('option');
                    opcion.value = producto;
                    opcion.textContent = producto;
                    productoIngresado.appendChild(opcion);
                }
            }
        });

        productoIngresado.addEventListener('change', () => {
            const marcaSeleccionada = marcaIngresada.value;
            const productoSeleccionado = productoIngresado.value;
            if (marcaSeleccionada && productoSeleccionado) {
                const precio = productosPorMarca[marcaSeleccionada][productoSeleccionado];
                precioIngresado.value = precio;
            }
        });

        document.querySelector('button[type="button"]').addEventListener('click', () => {
            const marca = marcaIngresada.value;
            const producto = productoIngresado.value;
            const precio = precioIngresado.value;
            if (marca && producto && precio) {
                if (!productoExiste(marca, producto)) {
                    agregarProductoATabla(marca, producto, precio);
                    guardarCarritoEnLocalStorage(marca, producto, precio);
                    actualizarTotal();
                } else {
                    Swal.fire({
                        title: 'Aviso!',
                        text: 'Este producto ya está en el carrito; si desea más cantidades, puede incrementarlo',
                        icon: 'info',
                        confirmButtonText: 'Okey!'
                    });
                }
            }
        });

        function productoExiste(marca, producto) {
            const filas = tabla.querySelectorAll('tr');
            for (let fila of filas) {
                const celdaMarca = fila.querySelector('td:first-child').textContent;
                const celdaProducto = fila.querySelector('td:nth-child(2)').textContent;
                if (celdaMarca === marca && celdaProducto === producto) {
                    return true; 
                }
            }
            return false; 
        }

        function agregarProductoATabla(marca, producto, precio) {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${marca}</td>
                <td>${producto}</td>
                <td>${precio}</td>
                <td>
                    <button class="decrementar">⬅️</button>
                    <input type="number" class="cantidad" value="1" min="1" max="20" style="width: 40px; text-align: center;">
                    <button class="incrementar">➡️</button>
                </td>
                <td><button class="eliminar">Eliminar</button></td>
            `;
            tabla.appendChild(fila);
            fila.querySelector('.incrementar').addEventListener('click', function() {
                const cantidadInput = fila.querySelector('.cantidad');
                let cantidad = parseInt(cantidadInput.value);
                if (cantidad < 20) {
                    cantidadInput.value = ++cantidad;
                    actualizarTotal();
                } else {
                    Swal.fire({
                        title: 'Cantidad Máxima Alcanzada',
                        text: 'No puedes ingresar más de 20 unidades.',
                        icon: 'warning',
                        confirmButtonText: 'Okey!'
                    });
                }
            });

            fila.querySelector('.decrementar').addEventListener('click', function() {
                const cantidadInput = fila.querySelector('.cantidad');
                let cantidad = parseInt(cantidadInput.value);
                if (cantidad > 1) {
                    cantidadInput.value = --cantidad;
                    actualizarTotal();
                } else {
                    Swal.fire({
                        title: 'Cantidad Mínima Alcanzada',
                        text: 'No puedes ingresar menos de 1 unidad.',
                        icon: 'warning',
                        confirmButtonText: 'Okey!'
                    });
                }
            });

            fila.querySelector('.cantidad').addEventListener('input', function() {
                const cantidadInput = fila.querySelector('.cantidad');
                let cantidad = parseInt(cantidadInput.value);
                if (isNaN(cantidad) || cantidad < 1) {
                    cantidadInput.value = 1;
                    Swal.fire({
                        title: 'Cantidad Mínima Alcanzada',
                        text: 'No puedes ingresar menos de 1 unidad.',
                        icon: 'warning',
                        confirmButtonText: 'Okey!'
                    });
                } else if (cantidad > 20) {
                    cantidadInput.value = 20;
                    Swal.fire({
                        title: 'Cantidad Máxima Alcanzada',
                        text: 'No puedes ingresar más de 20 unidades.',
                        icon: 'warning',
                        confirmButtonText: 'Okey!'
                    });
                }
                actualizarTotal();
            });

            fila.querySelector('.eliminar').addEventListener('click', function() {
                fila.remove();
                actualizarTotal();
            });
        }

        function actualizarTotal() {
            let total = 0;
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                const precioCelda = fila.querySelector('td:nth-child(3)').textContent;
                const cantidadInput = fila.querySelector('.cantidad').value;
                const precio = parseFloat(precioCelda);
                if (!isNaN(precio)) {
                    total += precio * parseInt(cantidadInput);
                }
            });
            precioTotal.textContent = total.toFixed(2);
        }

        function cargarCarritoDesdeLocalStorage() {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carrito.forEach(item => agregarProductoATabla(item.marca, item.producto, item.precio));
            actualizarTotal();
        }

        function guardarCarritoEnLocalStorage(marca, producto, precio) {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carrito.push({ marca, producto, precio });
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }

        window.borrarTabla = function() {
            tabla.innerHTML = '';
            precioTotal.textContent = '0.00';
            localStorage.removeItem('carrito');
        };

        const borrador = document.getElementById('borrador-tabla');
        borrador.addEventListener('click', borrarTabla); 
    })
      
        
        /*Finalizacion de compra*/
        
        document.getElementById('terminarCompra').addEventListener('click', mostrarFormularioEnvio);
                async function mostrarFormularioEnvio() {
                    const {value: datosEnvio } = await Swal.fire({
                        title: 'Datos de Envío',
                        html:
                        '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
                        '<input id="apellido" class="swal2-input" placeholder="Apellido">' +
                        '<input id="telefono" class="swal2-input" placeholder="Número de Teléfono" type="tel">' +
                        '<input id="email" class="swal2-input" placeholder="Email" type="email">' +
                        '<input id="direccion" class="swal2-input" placeholder="Dirección de Envío">',
                        showCancelButton: true,
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Volver',
                        preConfirm: () => {
                            const nombre = document.getElementById('nombre').value;
                            const apellido = document.getElementById('apellido').value;
                            const telefono = document.getElementById('telefono').value;
                            const email = document.getElementById('email').value;
                            const direccion = document.getElementById('direccion').value;
                            const nombreRegex = /^[A-Za-z]+$/; 
                            const apellidoRegex = /^[A-Za-z]+$/; 
                            const telefonoRegex = /^\d+$/;
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
                            const direccionRegex = /^[A-Za-z0-9\s,.-]+$/; 
                            if (!nombre || !nombreRegex.test(nombre)) {
                                Swal.showValidationMessage('Por favor ingresa un nombre válido (solo letras).');
                            } else if (!apellido || !apellidoRegex.test(apellido)) {
                                Swal.showValidationMessage('Por favor ingresa un apellido válido (solo letras).');
                            } else if (!telefono || !telefonoRegex.test(telefono)) {
                                Swal.showValidationMessage('Por favor ingresa un número de teléfono válido (solo números).');
                            } else if (!email || !emailRegex.test(email)) {
                                Swal.showValidationMessage('Por favor ingresa un email válido.');
                            } else if (!direccion || !direccionRegex.test(direccion)) {
                                Swal.showValidationMessage('Por favor ingresa una dirección válida (solo texto).');
                            }
                            return { nombre, apellido, telefono, email, direccion };
                        }
                    });
                    if (datosEnvio) {
                        await mostrarFormularioTarjeta(datosEnvio);
                    } else {
                        Swal.fire('Operación cancelada', '', 'info');
                    }
                }
                async function mostrarFormularioTarjeta(datosEnvio) {
                    const { value: datosTarjeta } = await Swal.fire({
                        title: 'Datos de la Tarjeta',
                        html:
                        '<input id="propietario" class="swal2-input" placeholder="Nombre del Propietario">' +
                        '<input id="numeroTarjeta" class="swal2-input" placeholder="Número de Tarjeta" type="text">' +
                        '<input id="fechaVencimiento" class="swal2-input" placeholder="MM/AA">' +
                        '<input id="pin" class="swal2-input" placeholder="PIN Trasero" type="text">',
                        confirmButtonText: 'Pagar',
                        showCancelButton: true,
                        cancelButtonText: 'Volver',
                        preConfirm: () => {
                            const propietario = document.getElementById('propietario').value;
                            const numeroTarjeta = document.getElementById('numeroTarjeta').value;
                            const fechaVencimiento = document.getElementById('fechaVencimiento').value;
                            const pin = document.getElementById('pin').value;
                            const propietarioRegex = /^[A-Za-z\s]+$/; 
                            const numeroTarjetaRegex = /^\d{16}$/; 
                            const fechaVencimientoRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; 
                            const pinRegex = /^\d{3}$/; 
                            if (!propietario || !propietarioRegex.test(propietario)) {
                                Swal.showValidationMessage('Por favor ingresa un nombre de propietario válido (solo letras).');
                            } else if (!numeroTarjeta || !numeroTarjetaRegex.test(numeroTarjeta)) {
                                Swal.showValidationMessage('Por favor ingresa un número de tarjeta válido (16 dígitos).');
                            } else if (!fechaVencimiento || !fechaVencimientoRegex.test(fechaVencimiento)) {
                                Swal.showValidationMessage('Por favor ingresa una fecha de vencimiento válida (MM/AA).');
                            } else if (!pin || !pinRegex.test(pin)) {
                                Swal.showValidationMessage('Por favor ingresa un PIN trasero válido (3 dígitos).');
                            }
                            return { propietario, numeroTarjeta, fechaVencimiento, pin };
                        }
                    });
                    if (datosTarjeta) {
                        Swal.fire('Gracias por su compra', '', 'success');
                    } else {
                        mostrarFormularioEnvio();
                    }
                }