import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";

const Home = () => {
    const[nama, setNama] = useState("")
    const[order_id, setOrder_id] = useState("")
    const[total, setTotal] = useState(0)

    const process = async () => {
        const data = {
            name: nama,
            order_id: order_id,
            total: total
        }
        console.log(data);
        
    }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "90vw",
          p: 4
        }}
      >
        <TextField type="text" label="Nama" value={nama} onChange={(e) => setNama(e.target.value)} sx={{mb: 2}} />
        <TextField type="text" label="Order ID" value={order_id} onChange={(e) => setOrder_id(e.target.value)} sx={{mb: 2}}/>
        <TextField type="number" label="Total" value={total} onChange={(e) => setTotal(e.target.value)} sx={{mb: 2}}/>
      
        <Box>
            <Button onClick={process} variant="onlined">Process</Button>
        </Box>
      </Box>
    </>
  );
};

export default Home;
