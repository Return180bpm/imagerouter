import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from "@material-ui/icons/StarBorder";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        overflowX: "hidden",
        overflowY: "scroll",
        backgroundColor: "#232323",
        height: "90vh",
    },
    gridList: {
        flexWrap: "nowrap",
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: "translateZ(0)",
    },
    title: {
        color: theme.palette.primary.light,
    },
    titleBar: {
        background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
    },
}));
const MiniGallery = (props) => {
    const { images, onHover, pointId } = props;
    const classes = useStyles();

    return (
        <GridList
            cellHeight={180}
            className={classes.gridList}
            cols={1.5}
            id={`${pointId}`}
            onMouseEnter={(e) => (onHover ? onHover(e.currentTarget.id) : null)}
            onMouseLeave={() => (onHover ? onHover(null) : null)}
        >
            {images &&
                images.map((image, ind) => {
                    return image.img_url ? (
                        <GridListTile key={ind}>
                            <img
                                className={props.classAdded}
                                src={image.img_url}
                                alt={image.img_title}
                            />
                            <GridListTileBar
                                title={image.img_title}
                                classes={{
                                    root: classes.titleBar,
                                    title: classes.title,
                                }}
                                actionIcon={
                                    <IconButton
                                        aria-label={`star ${image.img_title}`}
                                    >
                                        <StarBorderIcon
                                            className={classes.title}
                                        />
                                    </IconButton>
                                }
                            />
                        </GridListTile>
                    ) : null;
                })}
        </GridList>
    );
};

const Gallery = ({ allPoints, onClickMiniGallery, onHoverMiniGallery }) => {
    const classes = useStyles();
    const inputEl = React.useRef(null);
    // GALLERY
    // const onHover = (e) => {
    //     // console.log("onHover e", e.currentTarget.id);

    //     inputEl.current && inputEl.current.classList.remove(".active");
    //     const place_id = e.target.key;
    //     const hoveredPoint = document.getElementById(place_id);
    //     inputEl.current && hoveredPoint.classList.add("active");
    //     inputEl.current = hoveredPoint;
    // };

    return (
        <div className={classes.root}>
            {allPoints &&
                Object.keys(allPoints).length > 0 &&
                Object.keys(allPoints).map((pointId, ind) => {
                    const point = allPoints[pointId];

                    return (
                        <MiniGallery
                            images={point.images}
                            key={point.id}
                            pointId={point.id}
                            onHover={onHoverMiniGallery}
                            onClick={() => onClickMiniGallery(point.id)}
                        />
                    );
                })}
            {allPoints &&
                Object.keys(allPoints).length === 0 &&
                [1, 2, 3, 4, 5].map((index) => (
                    <MiniGallery
                        key={index}
                        classAdded="default-image"
                        images={[
                            {
                                img_url: "/image-placeholder.png",
                                img_title: "Images not available.",
                            },
                        ]}
                    />
                ))}
        </div>
    );
};

export default Gallery;
