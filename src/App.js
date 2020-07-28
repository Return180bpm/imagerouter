import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useState } from "react";
import "./App.css";

import Map from "./Map";
import Gallery from "./Gallery";
import {
    AppBar,
    Toolbar,
    Typography,
    Grid,
    Container,
} from "@material-ui/core";

function App() {
    const [photos, setPhotos] = useState([]);
    const [
        lastClickedMiniGalleryPointId,
        setLastClickedMiniGalleryPointId,
    ] = useState(null);
    const [hoveredPointId, setHoveredPointId] = useState(null);
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                margin: "0",
                padding: "0",
            }}
        >
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography style={{ flexGrow: 1 }} variant="h4">
                        ImageRouter
                    </Typography>
                    <nav
                        style={{
                            // width: 500,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        My Routes
                    </nav>
                </Toolbar>
            </AppBar>
            <Grid container style={{ height: "100%" }}>
                <Grid item sm={4}>
                    <Gallery
                        allPoints={photos}
                        onClickMiniGallery={setLastClickedMiniGalleryPointId}
                        onHoverMiniGallery={setHoveredPointId}
                    />
                </Grid>
                <Grid item sm={8}>
                    <Map
                        setImages={images => setPhotos(images)}
                        hoveredPointId={hoveredPointId}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

export default App;
