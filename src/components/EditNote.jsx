import React, { useEffect, useState } from 'react';
import OBR from "@owlbear-rodeo/sdk";
import { ID, METADATA_KEY, COMMS_ID } from "../constants";

export default function EditNote() {
  const [description, setDescription] = useState("");
  const [gmNotes, setGmNotes] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [status, setStatus] = useState("Loading...");

  // LOAD DATA on mount
  useEffect(() => {
    OBR.onReady(async () => {
      try {
        // Read ID from URL set in main.jsx
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const tokenId = urlParams.get("id");

        // Something went wrong and no ID, stop
        if (!tokenId) {
          setStatus("Error: No token ID found.");
          return;
        }

        setSelectedTokenId(tokenId);

        // Fetch specific token
        const items = await OBR.scene.items.getItems([tokenId]);
        const token = items[0];

        if (token) {
          const data = token.metadata[`${ID}/metadata`] || {};
          
          setDescription(data[METADATA_KEY.PUBLIC_DESC] || "");
          setGmNotes(data[METADATA_KEY.GM_NOTES] || "");
          setIsRevealed(data[METADATA_KEY.IS_REVEALED] || false);
          setStatus("Ready");
        } else {
          setStatus("Error: Token not found in scene.");
        }
      } catch (error) {
        console.error(error);
        setStatus("Error loading data.");
      }
    });
  }, []);

  // SAVE DATA
  const handleSave = async () => {
    if (!selectedTokenId) return;

    await OBR.scene.items.updateItems(
      [selectedTokenId], // IDs to update
      (items) => {
        // Loop through the items (only one here)
        for (let item of items) {
          // Create metadata object if it doesn't exist
          if (!item.metadata[`${ID}/metadata`]) {
            item.metadata[`${ID}/metadata`] = {};
          }

          // Update specific fields
          item.metadata[`${ID}/metadata`][METADATA_KEY.PUBLIC_DESC] = description;
          item.metadata[`${ID}/metadata`][METADATA_KEY.GM_NOTES] = gmNotes;
          item.metadata[`${ID}/metadata`][METADATA_KEY.IS_REVEALED] = isRevealed;
        }
      }
    );
    
    // Close the window after saving (optional, but feels nice)
    OBR.popover.close(`${ID}/edit-popover`);
  };

  const handleBroadcast = async () => {
    if (!selectedTokenId) return;

    // Ensure revealed first
    if (!isRevealed) {
        // If it was hidden, reveal it locally and save immediately
        setIsRevealed(true);
        // Perform a quick mini-save to ensure token updated
        await OBR.scene.items.updateItems([selectedTokenId], (items) => {
             for (let item of items) {
                if (!item.metadata[`${ID}/metadata`]) item.metadata[`${ID}/metadata`] = {};
                item.metadata[`${ID}/metadata`][METADATA_KEY.IS_REVEALED] = true;
             }
        });
    }

    // Send the signal
    OBR.broadcast.sendMessage(COMMS_ID, { tokenId: selectedTokenId });
    
    // Feedback to the DM/broadcaster
    setStatus("Sent to players!");
    setTimeout(() => setStatus("Ready"), 2000);
  };

  return (
    <div style={{ padding: "16px", color: "white", fontFamily: "sans-serif" }}>
      <h2>Edit Token Notes</h2>
      
      {/* Description Input */}
      <label style={{ display: "block", marginBottom: "8px" }}>
        Public Description (Players see this):
        <textarea
          style={{ width: "100%", height: "80px", marginTop: "4px" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {/* Private Notes Input */}
      <label style={{ display: "block", marginBottom: "8px" }}>
        Private Notes (Only you see this):
        <textarea
          style={{ width: "100%", height: "80px", marginTop: "4px", backgroundColor: "#f0f0f0" }}
          value={gmNotes}
          onChange={(e) => setGmNotes(e.target.value)}
        />
      </label>

      {/* Reveal Toggle */}
      <div style={{ marginBottom: "16px" }}>
        <label>
          <input
            type="checkbox"
            checked={isRevealed}
            onChange={(e) => setIsRevealed(e.target.checked)}
          />
          {" "} Allow others to view?
        </label>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={status !== "Ready"}
        style={{ padding: "8px 16px", cursor: "pointer", fontSize: "16px" }}
      >
        Save Notes
      </button>

      <p style={{ fontSize: "12px", color: "#ccc" }}>Status: {status}</p>

      {/* Broadcast Button */}
      <button 
        onClick={handleBroadcast}
        disabled={status !== "Ready"}
        style={{ 
          padding: "8px 16px", 
          marginLeft: "2px", 
          cursor: "pointer", 
          fontSize: "12px",
          backgroundColor: "#d69e2e", // Gold color to make it stand out
          color: "black",
          border: "none",
          borderRadius: "4px"
        }}
      >
        Show Everyone
      </button>
    </div>
  );
}