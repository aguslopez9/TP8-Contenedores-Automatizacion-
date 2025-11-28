# Configuración de SONAR_TOKEN

## ⚠️ Importante: Ubicación del Secret

El análisis de SonarQube se ejecuta en el **workflow de CI** (no en environments de QA o PROD), por lo que el `SONAR_TOKEN` debe estar configurado como un **secret global del repositorio**, no en un environment específico.

## ✅ Configuración Correcta

### 1. Ubicación del Secret

**GitHub → Settings → Secrets and variables → Actions → Repository secrets**

- ✅ **Repository secrets** (nivel global) ← **AQUÍ debe estar**
- ❌ **Environment secrets** (qa, prod) ← NO aquí

### 2. Pasos para Configurar

1. Ve a tu repositorio en GitHub
2. **Settings → Secrets and variables → Actions**
3. Haz click en **"New repository secret"**
4. Nombre: `SONAR_TOKEN`
5. Valor: Pega el token de SonarCloud
6. Haz click en **"Add secret"**

### 3. Obtener el Token de SonarCloud

1. Ve a https://sonarcloud.io
2. Inicia sesión
3. **My Account → Security → Generate Token**
4. Copia el token generado
5. Pégalo en el secret de GitHub

## 🔍 Verificar Configuración

### En el Workflow

El workflow usa el secret así:

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}  # ← Secret global
```

### Si está en Environment

Si el token está solo en el environment de QA, el workflow fallará con:

```
Error: SONAR_TOKEN not found
```

## 📝 Nota sobre Environments

Los **environments** (qa, prod) se usan para:
- Variables y secrets específicos de cada ambiente
- Aprobación manual para producción
- Configuración de deploy

El análisis de SonarQube **NO** se ejecuta en un environment, se ejecuta en el workflow de CI durante Pull Requests.

## ✅ Solución

1. **Mueve el SONAR_TOKEN** del environment de QA a Repository secrets
2. O **copia el token** y créalo también como Repository secret
3. El token puede estar en ambos lugares sin problema

## 🔐 Seguridad

- El token de SonarCloud es seguro compartirlo entre environments
- No contiene información sensible de los ambientes
- Solo se usa para autenticación con SonarCloud

