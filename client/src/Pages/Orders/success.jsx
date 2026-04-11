import React, { useContext } from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from '../../App';

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/checked.png" className="w-[80px] sm:w-[120px]" />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Tu pedido ha sido realizado</h3>
            <p className='mt-0 mb-0'>Gracias por tu pago.</p>
            <p className='mt-0 text-center'>La factura del pedido fue enviada a tu correo <b>{context?.userData?.email}</b></p>
            <Link to="/">
                <Button className="btn-org btn-border">Volver al inicio</Button>
            </Link>
        </section>
    )
}
