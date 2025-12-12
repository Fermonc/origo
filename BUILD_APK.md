# Cómo Generar el APK de Origo (Android)

Como tu proyecto usa funcionalidades de servidor (Next.js SSR/API), hemos configurado la app para que funcione como un "contenedor nativo" que carga tu sitio web en vivo.

## Requisitos Previos
Necesitas tener instalado **Android Studio** en tu computadora.

## Pasos para Generar el APK

1.  **Abrir el Proyecto en Android Studio**:
    *   Abre Android Studio.
    *   Selecciona **"Open"** (Abrir).
    *   Navega a la carpeta de tu proyecto: `Documents\Origo\android`.
    *   Haz clic en **OK**.

2.  **Esperar la Sincronización**:
    *   Android Studio comenzará a descargar las dependencias (Gradle). Esto puede tardar unos minutos la primera vez. Espera a que la barra de progreso inferior termine.

3.  **Generar el APK**:
    *   En el menú superior, ve a **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Espera a que termine el proceso.
    *   Verás una notificación "APK(s) generated successfully". Haz clic en **"locate"** para abrir la carpeta.
    *   **Si no ves la notificación:** Navega manualmente en tu explorador de archivos a:
        `Documents\Origo\android\app\build\outputs\apk\debug\app-debug.apk`

4.  **Instalar en tu Celular**:
    *   Copia el archivo `app-debug.apk` a tu celular (por USB, WhatsApp, Drive, etc.).
    *   Al abrirlo, te pedirá permiso para "Instalar aplicaciones desconocidas". Acéptalo.
    *   ¡Listo! Tendrás la app instalada.

## Alternativa Rápida (PWA)
Si no quieres instalar Android Studio, puedes instalar la app directamente desde el navegador de tu celular:
1.  Abre `https://origo-1629f.web.app/` en Chrome en tu Android.
2.  Toca los tres puntos (menú) y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3.  ¡Listo! Funcionará igual que una app nativa.
