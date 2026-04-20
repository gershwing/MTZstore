import React, { useContext, useEffect } from "react";
import MyListItems from "./myListItems";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const MyList = () => {
  const context = useContext(MyContext);
  const items = Array.isArray(context?.myListData) ? context.myListData : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    // ⭐ fuerza cargar en BOB
    context?.getMyListData?.("BOB");
  }, []);

  return (
    <section className="py-4 lg:py-6 pb-20 w-full">
      <div className="container flex flex-col md:flex-row gap-5">
        <div className="col1 w-full md:w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:flex-1">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
              <h2>Mi Lista</h2>
              <p className="mt-0 mb-0">
                Tienes{" "}
                <span className="font-bold text-primary">{items.length}</span>{" "}
                productos en Mi Lista
              </p>
            </div>

            {items.length > 0 ? (
              items.map((item, index) => (
                <MyListItems
                  key={item?._id || item?.productId || index}
                  item={item}
                />
              ))
            ) : (
              <div className="flex items-center justify-center flex-col py-10 px-3 gap-5">
                <img src="/mylistempty.png" className="w-[100px]" alt="Mi lista vacía" />
                <h3>Mi lista está actualmente vacía</h3>
                <Link to="/">
                  <Button className="btn-org btn-sm">Continuar comprando</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyList;
