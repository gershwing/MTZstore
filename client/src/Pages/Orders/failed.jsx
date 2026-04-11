import React from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

export const OrderFailed = () => {
    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/delete.png" className="w-[70px] sm:w-[120px]" />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Tu pedido no se completó</h3>
            <p className='mt-0 text-center'>Tu pedido falló por alguna razón</p>
            <Link to="/">
                <Button className="btn-org btn-border">Volver al inicio</Button>
            </Link>
        </section>
    )
}