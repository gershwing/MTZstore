import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { editData, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Collapse } from "react-collapse";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const MyAccount = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
  const [phone, setPhone] = useState('');

  const [formFields, setFormsFields] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const [changePassword, setChangePassword] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token === null) {
      history("/");
    }


  }, [context?.isLogin])


  useEffect(() => {
    if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {
      setUserId(context?.userData?._id);
      setTimeout(() => {
        setFormsFields({
          name: context?.userData?.name,
          email: context?.userData?.email,
          mobile: context?.userData?.mobile
        })
      }, 200);
      setPhone(
        typeof context?.userData?.mobile === "string" && context?.userData?.mobile.trim() !== ""
          ? context.userData.mobile
          : ""
      );


      setChangePassword({
        email: context?.userData?.email
      })
    }

  }, [context?.userData])



  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields(prev => ({ ...prev, [name]: value }));
    setChangePassword(prev => ({ ...prev, [name]: value }));
  }


  const valideValue = Object.values(formFields).every(el => el)

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.name === "") {
      context.alertBox("error", "Por favor ingrese su nombre");
      return false
    }

    if (formFields.email === "") {
      context.alertBox("error", "Por favor ingrese su correo");
      return false
    }

    if (formFields.mobile === "") {
      context.alertBox("error", "Por favor ingrese su celular");
      return false
    }


    editData(`/api/user/${userId}`, formFields, { withCredentials: true }).then((res) => {
      console.log(res)
      if (res?.error !== true) {
        setIsLoading(false);
        context.alertBox("success", res?.data?.message);

      } else {
        context.alertBox("error", res?.data?.message);
        setIsLoading(false);
      }

    })


  }

  const valideValue2 = Object.values(formFields).every(el => el)



  const handleSubmitChangePassword = (e) => {
    e.preventDefault();

    setIsLoading2(true);

    if (changePassword.oldPassword === "") {
      context.alertBox("error", "Ingrese su contraseña actual");
      return false
    }

    if (changePassword.newPassword === "") {
      context.alertBox("error", "Ingrese la nueva contraseña");
      return false
    }

    if (changePassword.confirmPassword === "") {
      context.alertBox("error", "Confirme su contraseña");
      return false
    }

    if (changePassword.confirmPassword !== changePassword.newPassword) {
      context.alertBox("error", "Las contraseñas no coinciden");
      return false
    }


    postData(`/api/user/reset-password`, changePassword, { withCredentials: true }).then((res) => {

      if (res?.error !== true) {
        setIsLoading2(false);
        context.alertBox("success", res?.message);
      } else {
        context.alertBox("error", res?.message);
        setIsLoading2(false);
      }

    })


  }

  return (
    <section className="py-3 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[20%]">

          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[50%]">
          <div className="card bg-white p-5 shadow-md rounded-md mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">Mi perfil</h2>
              <Button className="!ml-auto" onClick={() => setisChangePasswordFormShow(!isChangePasswordFormShow)}>Cambiar contraseña</Button>
            </div>
            <hr />

            <form className="mt-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 ">
                <div className="col">
                  <TextField
                    label="Nombre completo"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="name"
                    value={formFields.name || ""}
                    disabled={isLoading === true ? true : false}
                    onChange={onChangeInput}
                  />
                </div>

                <div className="col">
                  <TextField
                    type="email"
                    label="Correo"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    name="email"
                    value={formFields.email || ""}
                    disabled={true}
                    onChange={onChangeInput}
                  />
                </div>



                <div className="col">
                  <PhoneInput
                    defaultCountry="bo"
                    value={phone}
                    disabled={isLoading === true ? true : false}
                    onChange={(phone) => {
                      setPhone(phone);
                      setFormsFields(prev => ({ ...prev, mobile: phone }));
                    }}
                  />

                </div>

              </div>


              <br />

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={!valideValue} className="btn-org btn-sm w-[150px]">
                  {
                    isLoading === true ? <CircularProgress color="inherit" />
                      :
                      'Actualizar Perfil'
                  }
                </Button>

              </div>
            </form>
          </div>





          <Collapse isOpened={isChangePasswordFormShow}>
            <div className="card bg-white p-5 shadow-md rounded-md">
              <div className="flex items-center pb-3">
                <h2 className="pb-0">Cambiar contraseña</h2>
              </div>
              <hr />


              <form className="mt-8" onSubmit={handleSubmitChangePassword}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {
                    context?.userData?.signUpWithGoogle === false &&
                    <div className="col">
                      <TextField
                        label="Contraseña actual"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        name="oldPassword"
                        value={changePassword.oldPassword || ""}
                        disabled={isLoading2 === true ? true : false}
                        onChange={onChangeInput}
                      />
                    </div>
                  }



                  <div className="col">
                    <TextField
                      type="text"
                      label="Nueva contraseña"
                      variant="outlined"
                      size="small"
                      className="w-full"
                      name="newPassword"
                      value={changePassword.newPassword || ""}
                      onChange={onChangeInput}
                    />
                  </div>

                  <div className="col">
                    <TextField
                      label="Confirmar contraseña"
                      variant="outlined"
                      size="small"
                      className="w-full"
                      name="confirmPassword"
                      value={changePassword.confirmPassword || ""}
                      onChange={onChangeInput}
                    />
                  </div>


                </div>


                <br />

                <div className="flex items-center gap-4">
                  <Button type="submit" className="btn-org btn-sm w-[200px]">
                    {
                      isLoading2 === true ? <CircularProgress color="inherit" />
                        :
                        'Cambiar Contraseña'
                    }
                  </Button>

                </div>
              </form>



            </div>
          </Collapse>



        </div>
      </div>
    </section>
  );
};

export default MyAccount;
