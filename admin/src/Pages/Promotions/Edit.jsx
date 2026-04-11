// admin/src/Pages/Promotions/Edit.jsx
import React from "react";
import { useParams } from "react-router-dom";
import PromoForm from "../../Components/Promotions/PromoForm";

export default function PromotionEdit() {
  const { id } = useParams();
  return <PromoForm promotionId={id} />;
}