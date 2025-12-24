import React, { useEffect, useState } from 'react';
import OBR from "@owlbear-rodeo/sdk";
import { ID, METADATA_KEY } from "../constants";

export default function ViewNote() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    OBR.onReady(async () => {
      // 1. Get the Token ID from the URL (passed from main.jsx)
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const tokenId = urlParams.get("id");

      if (!tokenId) {
        setStatus("No token specified.");
        return;
      }

      // 2. Fetch the Token
      const items = await OBR.scene.items.getItems([tokenId]);
      const token = items[0];

      if (token) {
        const data = token.metadata[`${ID}/metadata`] || {};
        const publicText = data[METADATA_KEY.PUBLIC_DESC];

        // 3. Security Check: Is the description actually meant to be seen?
        // (We double-check here just in case)
        if (publicText && data[METADATA_KEY.IS_REVEALED]) {
          setDescription(publicText);
          setStatus("Ready");
        } else {
          setDescription("No description available.");
          setStatus("Empty");
        }
      } else {
        setStatus("Token not found.");
      }
    });
  }, []);

  if (status === "Loading...") return <div style={{color:"white"}}>Loading...</div>;

  return (
    <div style={{ 
      padding: "20px", 
      color: "white", 
      fontFamily: "sans-serif", 
      maxHeight: "300px", 
      overflowY: "auto" // Adds a scrollbar if text is too long
    }}>
      <h2 style={{marginTop: 0}}>Description</h2>
      
      <div style={{ 
        whiteSpace: "pre-wrap", // Preserves line breaks from the text box
        lineHeight: "1.5",
        fontSize: "16px"
      }}>
        {description}
      </div>
    </div>
  );
}