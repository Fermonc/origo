# 🚀 Guía de Despliegue: Firebase App Hosting

Tu aplicación **Origo** está lista para producción. Sigue estos pasos para desplegarla usando la tecnología más moderna de Firebase.

## 1. Subir Código a GitHub
Como ya tienes experiencia con Git, solo necesitas subir tu repositorio local a GitHub.

1.  Crea un **nuevo repositorio** en GitHub (público o privado).
2.  En tu terminal (dentro de la carpeta `Origo`), ejecuta:
    ```bash
    git remote add origin <URL_DE_TU_REPO>
    git branch -M main
    git push -u origin main
    ```

## 2. Conectar en Firebase Console
1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Selecciona tu proyecto **Origo**.
3.  En el menú izquierdo, busca **App Hosting** (en la sección *Build* o *Compilación*).
4.  Haz clic en **Comenzar** (Get Started).
5.  Sigue el flujo para conectar tu cuenta de **GitHub**.
6.  Selecciona el repositorio que acabas de subir (`origo-web` o el nombre que le hayas puesto).
7.  **Configuración de Despliegue**:
    *   **Directorio raíz**: Déjalo en blanco (o `/` si lo pide), ya que tu app está en la raíz.
    *   **Rama**: `main`.
    *   **Nombre del backend**: Puedes dejar el que genera automáticamente.

## 3. Variables de Entorno (Automatizado)
He creado el archivo `apphosting.yaml` en tu proyecto. Este archivo le dice a Firebase qué variables usar.

1.  **No necesitas agregarlas manualmente** en la consola por ahora.
2.  Al hacer el `git push` con este nuevo archivo, Firebase lo detectará y usará las variables para construir la app.

> **Nota**: Como estas claves son públicas (`NEXT_PUBLIC_`), es seguro tenerlas en este archivo para facilitar el despliegue.

## 4. Corregir y Desplegar
El error de compilación que viste se debe a que faltaban estas variables. Vamos a subir el arreglo:

1.  En tu terminal, ejecuta:
    ```bash
    git add .
    git commit -m "Fix: Add apphosting.yaml for environment variables"
    git push
    ```

2.  Vuelve a la **Consola de Firebase**. Verás que se inicia un nuevo "Lanzamiento" (Rollout) automáticamente.
3.  Esta vez, la compilación debería funcionar correctamente.

## 4. Finalizar
Haz clic en **Deploy**. Firebase detectará automáticamente que es una app Next.js, instalará las dependencias, construirá el proyecto y lo servirá globalmente.

¡Eso es todo! Cada vez que hagas un `git push`, Firebase actualizará tu app automáticamente.
