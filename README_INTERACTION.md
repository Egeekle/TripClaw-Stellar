# TripClaw - Flujo de Interacción del Usuario 🗺️🤖

Este documento describe paso a paso la experiencia de un usuario navegando por la aplicación **TripClaw** y cómo interactúa con el ecosistema de agentes impulsado por ZeroClaw y la red de Stellar.

---

## 1. Onboarding & Conexión (`/`)
El punto de entrada a la aplicación. Aquí el usuario configura su conexión y personaliza su perfil.

* **Paso 1 (Conexión al Gateway):** El usuario ingresa un código de emparejamiento (Pairing Code) para conectarse a su instancia local/remota de ZeroClaw. Si no hay conexión, la app degrada elegantemente a un "Modo Demo" para no bloquear la experiencia.
* **Paso 2 (Preferencias de Viaje):** El usuario selecciona sus intereses principales (Ej: *Aventura, Gastronomía, Lujo, Cultura*).
* **Paso 3:** Una vez configurado, el usuario es redirigido al Dashboard principal.

---

## 2. Dashboard Central (`/dashboard`)
El centro de control táctico. Aquí el usuario tiene una visión panorámica de su "Swarm" (enjambre) de agentes marítimos/turísticos.

* **Monitoreo del Swarm:** Visualiza en tiempo real cuántos agentes están activos y la "salud" de la red.
* **Skills (Habilidades):** El usuario puede ver tarjetas interactivas que muestran las capacidades de los agentes (Analizador de viajes, Pronóstico del clima, Recomendador local, etc.). Al hacer clic en un Skill, el usuario es llevado directamente a la Consola para ejecutarlo.
* **Activity Feed:** Un panel lateral muestra un registro en vivo (estilo terminal) de lo que los agentes están "pensando" o haciendo en ese momento.

---

## 3. Exploración Interactiva (`/map`)
Una vista geoespacial (enfocada en Perú) donde la inteligencia artificial cobra vida.

* **Exploración Visual:** Un mapa dinámico (estilo Google Maps, desarrollado con Leaflet) muestra el territorio peruano.
* **Agentes en Vivo:** El usuario ve iconos de robots (agentes) moviéndose autónomamente por el mapa. Ocasionalmente muestran globos de texto con descubrimientos en tiempo real (ej: *"🗻 Machu Picchu is breathtaking"* o *"🏄‍♂️ Great waves in Miraflores"*).
* **Interacción con Destinos:** 
  * El usuario hace clic en un icono de destino (Ej: *Cusco, Lima, Arequipa*).
  * ⚙️ **Acción interna:** Esto dispara automáticamente la habilidad `trip_analyzer`.
  * 👁️ **Respuesta:** Se abre un modal flotante donde el agente presenta un informe estructurado sobre seguridad, costos, multitudes y recomendaciones locales para esa ciudad específica.

---

## 4. Consola del Agente (`/console`)
La interfaz de interacción directa humano-máquina.

* **Chat Directo:** El usuario puede escribir solicitudes en lenguaje natural al agente (Ej: *"Búscame un buen restaurante en el Valle Sagrado"*).
* **Comandos Rápidos (Quick Commands):** Botones preconfigurados (Ej: *📍 Analyze Cusco*, *☀️ Arequipa Weather*) que permiten al usuario ejecutar herramientas sin necesidad de escribir prompts largos.
* **Logs y Eventos:** Una pestaña técnica que muestra el crudo de las respuestas JSON del servidor ZeroClaw, útil para depuración de "Tool Calls" (llamadas a herramientas).

---

## 5. Pagos Web3 con Stellar (`/payment`)
La etapa final del flujo, donde el usuario confirma y paga su viaje o los servicios del agente.

* **Revisión de Factura:** El usuario visualiza un desglose detallado de su paquete premium (Ej: Vuelos, Alojamiento, Comisión de TripClaw y una mínima tarifa de red). Todo presupuestado en **XLM**.
* **Conexión de Billetera:**
  * El usuario hace clic en "Connect Freighter".
  * Se abre una solicitud hacia la extensión del navegador Freighter (Stellar Wallets Kit).
  * Una vez aprobada, la UI muestra la clave pública del usuario (Ej: `GABC...WXYZ`).
* **Ejecución del Pago:**
  * El usuario hace clic en "Confirm & Pay".
  * La aplicación simula o procesa la firma de la transacción en la red Testnet de Stellar.
  * Se muestra una pantalla de éxito confirmando la reserva del viaje en el libro mayor (ledger) inmutable.

---

## 🔄 Resumen del Ciclo de Vida Ideal
1. Se **conecta** y define sus gustos. `(Onboarding)`
2. **Explora** las capacidades disponibles de los agentes. `(Dashboard)`
3. Navega por el **Mapa** y hace clic en *Cusco* para recibir insights de seguridad. `(Mapa)`
4. Usa la **Consola** para pedirle al agente un itinerario detallado de 3 días para su viaje. `(Console)`
5. Feliz con el itinerario, va a la sección de **Pagos**, conecta su billetera Stellar y asegura la compra. `(Payment)`
