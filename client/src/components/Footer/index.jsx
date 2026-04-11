import React, { useContext } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

import Drawer from "@mui/material/Drawer";
import CartPanel from "../CartPanel";
import { MyContext } from "../../App";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { ProductZoom } from "../ProductZoom";
import { IoCloseSharp } from "react-icons/io5";
import { ProductDetailsComponent } from "../ProductDetails";
import AddAddress from "../../Pages/MyAccount/addAddress";

// ✅ Mostrar BOB siempre
import { formatPrice } from "../../utils/formatPrice";

const FREE_SHIPPING_THRESHOLD_BOB = 100; // Ajusta el umbral si lo necesitas

const Footer = () => {
  const context = useContext(MyContext);

  return (
    <>
      <footer className="py-6 bg-[#fafafa]">
        <div className="container">
          <div className="flex items-center justify-center gap-2 py-3 lg:py-8 pb-0 lg:pb-8 px-0 lg:px-5 scrollableBox footerBoxWrap">
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaShippingFastSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Envío gratuito</h3>
              {/* Antes: "$100" → ahora BOB */}
              <p className="text-[12px] font-[500]">
                Para todos los pedidos superiores a: {formatPrice(FREE_SHIPPING_THRESHOLD_BOB, "BOB")}
              </p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <PiKeyReturnLight className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Devolución 30D</h3>
              <p className="text-[12px] font-[500]">Para un producto de intercambio</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BsWallet2 className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Pago Seguro</h3>
              <p className="text-[12px] font-[500]">Tarjetas de pago aceptadas</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaGiftSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Regalos especiales</h3>
              <p className="text-[12px] font-[500]">Para el primer pedido</p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BiSupport className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Soporte 24/7</h3>
              <p className="text-[12px] font-[500]">Póngase en contacto con nosotros en cualquier momento</p>
            </div>
          </div>
          <br />

          <hr />

          <div className="footer flex px-3 lg:px-0 flex-col lg:flex-row py-8">
            <div className="part1 w-full lg:w-[25%] border-r border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[18px] font-[600] mb-4">Contáctanos</h2>
              <p className="text-[13px] font-[400] pb-4">
                MTZstore - La mejor tienda de la región
                <br />
                6 de Octubre entre San Felipe y Aldana
              </p>

              <Link
                className="link text-[13px]"
                to="mailto:someone@example.com"
              >
                mtzstore.bo@gmail.com
              </Link>

              <span className="text-[22px] font-[600] block w-full mt-3 mb-5 text-primary">
                (+591) 71854443
              </span>

              <div className="flex items-center gap-2">
                <IoChatboxOutline className="text-[40px] text-primary" />
                <span className="text-[16px] font-[600]">
                  Chat en línea
                  <br />
                  Obtenga ayuda de expertos
                </span>
              </div>
            </div>

            <div className="part2  w-full lg:w-[40%] flex pl-0 lg:pl-8 mt-5 lg:mt-0">
              <div className="part2_col1 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Productos</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Precios bajos
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Nuevos productos
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Las mejores novedades
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Contáctanos
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Ubicación
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Tiendas
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="part2_col2 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Nuestra empresa</h2>

                <ul className="list">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Reparto
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Aviso Legal
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Terminos y condiciones de uso
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Sobre nosotros
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Pago seguro
                    </Link>
                  </li>
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link to="/" className="link">
                      Iniciar Sesión
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="part2  w-full lg:w-[35%] flex pl-0 lg:pl-8 flex-col pr-8 mt-5 lg:mt-0">
              <h2 className="text-[18px] font-[600] mb-2 lg:mb-4">
                Suscribirse al boletín
              </h2>
              <p className="text-[13px]">
                Suscríbase a nuestro último boletín para recibir noticias sobre descuentos especiales.
              </p>

              <form className="mt-5">
                <input
                  type="text"
                  className="w-full h-[45px] border outline-none pl-4 pr-4 rounded-sm mb-4 focus:border-[rgba(0,0,0,0.3)]"
                  placeholder="Tu dirección de correo electrónico"
                />

                <Button className="btn-org">SUSCRÍBETE</Button>

                <FormControlLabel
                  className="mt-3 lg:mt-0 block w-full"
                  control={<Checkbox />}
                  label=" Acepto los términos y condiciones y la política de privacidad"
                />
              </form>
            </div>
          </div>
        </div>
      </footer>

      <div className="bottomStrip border-t border-[rgba(0,0,0,0.1)] pt-3 pb-[100px] lg:pb-3 bg-white">
        <div className="container flex items-center justify-between flex-col lg:flex-row gap-4 lg:gap-0">
          <ul className="flex items-center gap-2">
            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaFacebookF className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <AiOutlineYoutube className="text-[21px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaPinterestP className="text-[17px] group-hover:text-white" />
              </Link>
            </li>

            <li className="list-none">
              <Link
                to="/"
                target="_blank"
                className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
              >
                <FaInstagram className="text-[17px] group-hover:text-white" />
              </Link>
            </li>
          </ul>

          <p className="text-[13px] text-center mb-0">
            © 2025 - Comercio Electrónico Oruro-Bolivia
          </p>

          <div className="flex items-center gap-1">
            <img src="/carte_bleue.png" alt="image" />
            <img src="/visa.png" alt="image" />
            <img src="/master_card.png" alt="image" />
            <img src="/american_express.png" alt="image" />
            <img src="/paypal.png" alt="image" />
          </div>
        </div>
      </div>

      {/* Cart Panel - fixed desde navegación */}
      {context.openCartPanel && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/10 z-[9998]"
            onClick={context.toggleCartPanel(false)}
          />

          {/* Panel */}
          <div
            className="fixed right-0 bottom-0 w-[380px] max-w-[90vw] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-[9999] flex flex-col"
            style={{ top: document.querySelector('.navigation')?.getBoundingClientRect()?.bottom || 120 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 flex-shrink-0">
              <h4 className="text-[15px] font-[600] text-gray-800">
                Carrito de compra ({context?.cartData?.length})
              </h4>
              <IoCloseSharp
                className="text-[20px] cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
                onClick={context.toggleCartPanel(false)}
              />
            </div>

            {/* Content */}
            {context?.cartData?.length !== 0 ? (
              <CartPanel data={context?.cartData} />
            ) : (
              <div className="flex items-center justify-center flex-col flex-1 gap-4 px-4">
                <img src="/empty-cart.png" className="w-[120px] opacity-80" />
                <h4 className="text-[14px] text-gray-500">Su carrito esta vacio</h4>
                <Button className="btn-org btn-sm" onClick={context.toggleCartPanel(false)}>
                  Continuar comprando
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Address Panel - fixed desde navegación */}
      {context.openAddressPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/10 z-[9998]"
            onClick={context.toggleAddressPanel(false)}
          />
          <div
            className="fixed right-0 bottom-0 w-[400px] max-w-[90vw] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-[9999] flex flex-col"
            style={{ top: document.querySelector('.navigation')?.getBoundingClientRect()?.bottom || 120 }}
          >
            <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 flex-shrink-0">
              <h4 className="text-[15px] font-[600] text-gray-800">
                {context?.addressMode === "add" ? "Agregar" : "Editar"} direccion de entrega
              </h4>
              <IoCloseSharp
                className="text-[20px] cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
                onClick={context.toggleAddressPanel(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <AddAddress />
            </div>
          </div>
        </>
      )}

      <Dialog
        open={context?.openProductDetailsModal.open}
        fullWidth={context?.fullWidth}
        maxWidth={context?.maxWidth}
        onClose={context?.handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailsModal"
      >
        <DialogContent>
          <div className="flex items-center w-full productDetailsModalContainer relative">
            <Button
              className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={context?.handleCloseProductDetailsModal}
            >
              <IoCloseSharp className="text-[20px]" />
            </Button>
            {context?.openProductDetailsModal?.item?.length !== 0 && (
              <>
                <div className="col1 w-[40%] px-3 py-8">
                  <ProductZoom images={context?.openProductDetailsModal?.item?.images} />
                </div>

                <div className="col2 w-[60%] py-8 px-8 pr-16 productContent ">
                  <ProductDetailsComponent item={context?.openProductDetailsModal?.item} />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;

