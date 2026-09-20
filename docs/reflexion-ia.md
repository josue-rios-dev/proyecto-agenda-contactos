# Reflexión E12: ¿qué datos de un contacto es aceptable enviar a un servicio externo?

Una agenda tiene datos de otras personas que nunca aceptaron que su información salga de mi computadora. Por eso, antes de conectar la aplicación con un modelo de lenguaje, me pregunté no solo qué necesita el modelo, sino qué tengo derecho a compartir.

Decidí enviar solo tres datos: el nombre de pila, el grupo y las notas. El nombre hace que el mensaje suene personal, el grupo define el tono (no se le escribe igual a un cliente que a un familiar) y las notas dan contexto. No envío el teléfono, el correo ni el apellido, porque el modelo no los necesita para redactar un texto y son los datos que permiten identificar y ubicar a alguien. El número se usa solo en mi equipo, para armar el enlace de WhatsApp.

Lo más delicado son las notas, porque son texto libre y podría haber escrito ahí algo sensible, como una deuda o un problema familiar. Para reducir el riesgo, la pantalla avisa qué datos se envían, el envío ocurre solo cuando pulso el botón y puedo editar el mensaje antes de abrir WhatsApp. Una mejora sería dejar elegir si se incluyen las notas.

Esto coincide con el principio de proporcionalidad de la Ley 29733 de Protección de Datos Personales del Perú: no usar más información de la necesaria.

También reconozco que dejar la clave de API en el navegador solo es aceptable en un laboratorio. En un producto real la llamada pasaría por un servidor propio.

**Conclusión:** es aceptable enviar lo mínimo indispensable, con el usuario informado y en control de cada envío. No lo es enviar la agenda completa ni datos que identifiquen a la persona si el resultado no los necesita.