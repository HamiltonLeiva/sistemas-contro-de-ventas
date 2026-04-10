# QA Checklist Predeploy

## Objetivo
Checklist ejecutable para validacion de release en responsive, UX, compatibilidad, rendimiento y regresiones.

## Comandos
- `npm run test:api`
- `npm run test:e2e`

## Matriz de navegadores
- Chrome (estable)
- Firefox (estable)
- Edge (estable)

## Matriz de viewports
- 320x640
- 768x1024
- 1024x1366
- 1366x768
- 1920x1080

## Checklist funcional
- [ ] Dashboard carga KPIs sin errores
- [ ] Navegacion lateral cambia de seccion correctamente
- [ ] Formulario de venta abre/cierra y valida errores
- [ ] Crear/editar/eliminar cliente funciona
- [ ] Crear/editar/eliminar producto funciona
- [ ] Guardar venta descuenta stock correctamente

## Checklist UI/UX
- [ ] Sin scroll horizontal en todos los viewports
- [ ] Botones tactiles con area adecuada
- [ ] Foco visible al navegar con teclado
- [ ] Textos legibles y sin truncamientos severos

## Checklist rendimiento
- [ ] Primera carga aceptable en red lenta
- [ ] No bloqueos visibles al interactuar rapido
- [ ] Recursos estaticos con cache-control correcto
- [ ] Compresion HTTP activa

## Checklist consola
- [ ] Sin `pageerror` en runtime
- [ ] Sin errores en consola de navegador

## Resultado
- Aprobado solo si todas las casillas estan completas.
