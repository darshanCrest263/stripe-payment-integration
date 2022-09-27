import "./App.css";
import { Button, Card, Modal, Stack, TextField } from "@mui/material";
import CardWrapper from "./components/HOC/CardWrapper";
import coffeeImage from "./assets/coffee.webp";
import QtyIncrementDecrement from "./components/QtyIncrementDecrement";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Box } from "@mui/system";
import Confetti from "react-confetti";

function App() {
  const [totalItems, setTotalItems] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const cardElementOpetions = {
    // to add custom style
    style: {
      base: {
        fontSize: "16px",
        color: "black",
      },
      invalid: {
        color: "red",
      },
    },
    hidePostalCode: true,
  };

  const incrementHandler = () => {
    setTotalItems((prevState) => prevState + 1);
  };

  const decrementHandler = () => {
    setTotalItems((prevState) => prevState - 1);
  };

  const handlePay = async (data) => {
    const billingDetails = {
      name: data.name,
      email: data.email,
      address: {
        city: data.city,
        line1: data.address,
        state: data.state,
        postal_code: data.zip,
      },
    };

    setIsProcessing(true);

    // creating the payment intent
    const clientSecret = await axios.post(
      `${process.env.REACT_APP_BE_SERVER}/api/payment-intents`,
      {
        amount: totalItems * 2 * 100,
        description: "Test for payment gateway",
        shipping: billingDetails,
      }
    );

    // adding the payment method and card details.
    const cardElement = elements.getElement(CardElement);

    const paymentMethodReq = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: billingDetails,
    });

    console.log(paymentMethodReq);

    // confirm the card payments.
    const confirmCardPayment = await stripe.confirmCardPayment(
      clientSecret.data.data,
      {
        payment_method: paymentMethodReq.paymentMethod.id,
      }
    );

    console.log(confirmCardPayment);
    setIsProcessing(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <>
      {isSuccessModalOpen && (
        <Confetti numberOfPieces={450} style={{ zIndex: "1301" }} />
      )}
      <form onSubmit={handleSubmit(handlePay)}>
        <Stack
          alignItems="center"
          sx={{ height: "100vh", backgroundColor: "white" }}
          spacing={2}
          mt={2}
        >
          {/* item description */}
          <CardWrapper>
            <Stack direction="column" alignItems="center" spacing={2}>
              <img
                src={coffeeImage}
                alt="coffee"
                width="200px"
                height="150px"
                style={{ borderRadius: "8px" }}
              />
              <Stack direction="row">
                <QtyIncrementDecrement
                  quantity={totalItems}
                  onAdd={incrementHandler}
                  onRemove={decrementHandler}
                />
              </Stack>
            </Stack>
          </CardWrapper>

          {/* user details */}
          <CardWrapper>
            <Stack direction="column" spacing={1}>
              <TextField
                size="small"
                label="Name"
                {...register("name", { required: "Please enter name!" })}
                error={errors?.name}
                helperText={errors?.name?.message}
              />
              <TextField
                size="small"
                label="Email"
                {...register("email", { required: "Please enter email!" })}
                error={errors?.email}
                helperText={errors?.email?.message}
              />
              <TextField
                size="small"
                label="Address"
                {...register("address", { required: "Please enter address!" })}
                error={errors?.address}
                helperText={errors?.address?.message}
              />
              <TextField
                size="small"
                label="City"
                {...register("city", { required: "Please enter city!" })}
                error={errors?.city}
                helperText={errors?.city?.message}
              />
              <TextField
                size="small"
                label="State"
                {...register("state", { required: "Please enter state!" })}
                error={errors?.state}
                helperText={errors?.state?.message}
              />
              <TextField
                size="small"
                label="ZIP"
                {...register("zip", {
                  required: "Please enter zip!",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Please enter valid zipcode!",
                  },
                })}
                error={errors?.zip}
                helperText={errors?.zip?.message}
              />
            </Stack>
          </CardWrapper>
          {/* card input and payment button */}
          <CardWrapper>
            <Stack direction="column" spacing={2}>
              <Stack
                sx={{ border: "1px solid grey", borderRadius: "4px" }}
                p={1}
              >
                <CardElement options={cardElementOpetions}></CardElement>
              </Stack>
              <Button
                disabled={isProcessing}
                fullWidth
                variant="contained"
                sx={{ background: "#121212" }}
                type="submit"
              >
                {isProcessing
                  ? "Processing..."
                  : totalItems > 0
                  ? `Pay $${totalItems * 2}`
                  : "Pay"}
              </Button>
            </Stack>
          </CardWrapper>
        </Stack>
      </form>
      <Modal
        open={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
        }}
      >
        <Box
          sx={{
            transform: "translate(-50%,-50%)",
            top: "50%",
            left: "50%",
            position: "absolute",
            background: "white",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <>
            <Stack>Successfully Paid!</Stack>
          </>
        </Box>
      </Modal>
    </>
  );
}

export default App;
