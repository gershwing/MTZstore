/**
 * VARIANTES - Servicios Digitales > Hosting y Dominios > Servidores VPS
 * Ruta: admin/src/variantes/servicios-digitales/hosting-dominios/servidores-vps/variantes.js
 *
 * IMPORTANTE: Solo productos / servicios digitales (sin entrega física).
 * condicion: siempre ["Nuevo"] — licencias y servicios no son Usados.
 *
 * tipo: "imagen" → el vendedor sube una foto por opción en el panel admin.
 *                  El cliente elige tocando la imagen en el frontend (client).
 *                  Uso MÍNIMO: solo donde el logo / badge del software
 *                  es lo que identifica visualmente la opción.
 * tipo: "texto"  → PREDOMINANTE: plan, capacidad, plazo, usuarios,
 *                  región de activación, número de licencias.
 */

export const variantes = {

  condicion: {
    tipo: "texto",
    requerido: true,
    opciones: ["Nuevo"]   // ← servicios digitales siempre Nuevo
  },

  tipo: {
    tipo: "texto",
    opciones: ["VPS (Virtual Private Server) Linux", "VPS Windows", "VPS administrado (managed)",
               "VPS no administrado (unmanaged)", "Servidor dedicado (bare metal)",
               "Servidor dedicado administrado", "Cloud server (instancia cloud)",
               "Servidor de juegos (game server)", "Servidor de bases de datos"]
  },

  plan_recursos: {
    tipo: "texto",
    opciones: ["1 vCPU / 1 GB RAM / 25 GB SSD", "2 vCPU / 2 GB RAM / 50 GB SSD",
               "2 vCPU / 4 GB RAM / 80 GB SSD", "4 vCPU / 8 GB RAM / 160 GB SSD",
               "6 vCPU / 16 GB RAM / 320 GB SSD", "8 vCPU / 32 GB RAM / 640 GB SSD",
               "16 vCPU / 64 GB RAM / 1 TB SSD", "Dedicado (a medida — ver descripción)"]
  },

  sistema_operativo: {
    tipo: "texto",
    opciones: ["Ubuntu 22.04 LTS", "Ubuntu 20.04 LTS", "Debian 12", "CentOS Stream 9",
               "AlmaLinux 9", "Rocky Linux 9", "Windows Server 2022", "Windows Server 2019",
               "Elegir al activar"]
  },

  plazo: {
    tipo: "texto",
    opciones: ["1 mes", "3 meses", "6 meses", "1 año", "2 años"]
  },

  datacenter_region: {
    tipo: "texto",
    opciones: ["LATAM / São Paulo (Brasil)", "LATAM / Bogotá (Colombia)", "USA / Miami",
               "USA / Nueva York", "USA / Los Ángeles", "Europa / Frankfurt", "Europa / Amsterdam",
               "Asia / Singapur", "Múltiples regiones"]
  },

  ancho_banda: {
    tipo: "texto",
    opciones: ["1 TB / mes", "2 TB / mes", "5 TB / mes", "10 TB / mes", "Ilimitado (fair use)", "Pago por uso"]
  },

  backup: {
    tipo: "texto",
    opciones: ["Sin backup", "Backup semanal", "Backup diario", "Backup en tiempo real"]
  },

  marca_proveedor: {
    tipo: "imagen",
    nota: "El vendedor sube el logo del proveedor. El cliente identifica el servicio por la imagen.",
    guia_vendedor: [
      "DigitalOcean (logo)", "Linode / Akamai (logo)", "Vultr (logo)",
      "Hetzner (logo)", "AWS Lightsail (logo)", "Google Cloud (logo)",
      "Azure (logo)", "Hostinger VPS (logo)", "Contabo (logo)",
      "Proveedor local LATAM (logo)"
    ]
  },

}; // fin variantes

export function getAtributos() { return variantes; }
