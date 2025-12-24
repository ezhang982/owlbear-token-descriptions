import React from 'react'
import ReactDOM from 'react-dom/client'
import OBR from "@owlbear-rodeo/sdk"
import { ID, COMMS_ID } from "./constants";

// Imports for our components
import EditNote from "./components/EditNote"
import ViewNote from "./components/ViewNote"


// 1. The "Background" Logic
function initBackground() {
  OBR.onReady(() => {
    
    // --- MENU 1: THE EDITOR (GM ONLY) ---
    OBR.contextMenu.create({
      id: `${ID}/edit-menu`,
      icons: [
        {
          icon: "/contract.png",
          label: "Edit Notes",
          filter: {
            every: [{ key: "layer", value: "CHARACTER" }],
            permissions: ["UPDATE"],
          },
        },
      ],
      onClick(context) {
        const tokenId = context.items[0].id;
        OBR.popover.open({
          id: `${ID}/edit-popover`,
          url: `/edit?id=${tokenId}`,
          height: 400,
          width: 300,
        });
      },
    });

    // --- MENU 2: THE VIEWER (PLAYERS) ---
    OBR.contextMenu.create({
      id: `${ID}/view-menu`,
      icons: [
        {
          icon: "/file.png", 
          label: "View Description",
          filter: {
            every: [
              { key: "layer", value: "CHARACTER" },
              // Only show if "isRevealed" is true
              { key: ["metadata", `${ID}/metadata`, "isRevealed"], value: true } 
            ],
          },
        },
      ],
      onClick(context) {
        const tokenId = context.items[0].id;
        OBR.popover.open({
          id: `${ID}/view-popover`,
          url: `/view?id=${tokenId}`,
          height: 300,
          width: 300,
          // Anchor to the token so it looks like a speech bubble!
          anchorElementId: context.items[0].id, 
          anchorOrigin: { horizontal: "CENTER", vertical: "BOTTOM" },
          transformOrigin: { horizontal: "CENTER", vertical: "TOP" },
        });
      },
    });

    // The Broadcast Listener to run for everyone
    OBR.broadcast.onMessage(COMMS_ID, (event) => {
      const { tokenId } = event.data;

      // Safety/Efficiency check, ignore broadcast for GM who initiated the broadcast
      if (event.connectionId === OBR.player.getConnectionId()) {
        return;
      }

      // Force open the View Popover
      OBR.popover.open({
        id: `${ID}/view-popover`,
        url: `/view?id=${tokenId}`,
        height: 300,
        width: 300,
        anchorElementId: tokenId,
        anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
        transformOrigin: { horizontal: "CENTER", vertical: "CENTER" },
        // "disableClickAway" prevents them from closing it accidentally immediately
        disableClickAway: false,
      });
    });
  });
}

// 2. The "Router" Logic
const root = ReactDOM.createRoot(document.getElementById('root'));
const path = window.location.pathname;

if (path === "/edit") {
  root.render(
    <React.StrictMode>
      <EditNote />
    </React.StrictMode>
  )
} else if (path === "/view") {
  root.render(
    <React.StrictMode>
       <ViewNote />
    </React.StrictMode>
  )
} else {
  initBackground();
}