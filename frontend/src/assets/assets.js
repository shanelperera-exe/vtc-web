import logo1 from "./vtc_logo1.svg";
import logo2 from "./vtc_logo2.svg";
import logo3 from "./vtc_logo3.svg";

import cleaningIcon from "./catslide_icons/cleaning.png";
import electricIcon from "./catslide_icons/electric.png";
import homeIcon from "./catslide_icons/home.png";
import kitchenIcon from "./catslide_icons/kitchen.png";
import plasticIcon from "./catslide_icons/plastic.png";
import stationaryIcon from "./catslide_icons/stationary.png";

import cleaningItemsImg from "./carouselimgs/cleaning_items_img.png";
import kitchenItemsImg from "./carouselimgs/kitchen_items_img.png";
import plasticItemsImg from "./carouselimgs/plastic_items_img.png";
import stationaryItemsImg from "./carouselimgs/stationary_items_img.png";

import cleaningCatIcon from "./cat_imgs/cleaning.png"
import kitchenCatIcon from "./cat_imgs/kitchen.png"
import plasticCatIcon from "./cat_imgs/plastic.png"

const catSlideIcons = {
    cleaning: cleaningIcon,
    electric: electricIcon,
    home: homeIcon,
    kitchen: kitchenIcon,
    plastic: plasticIcon,
    stationary: stationaryIcon,
};

const carouselImgs = {
    cleaning: cleaningItemsImg,
    kitchen: kitchenItemsImg,
    plastic: plasticItemsImg,
    stationary: stationaryItemsImg,
};

const catImgs = {
    cleaning: cleaningCatIcon,
    kitchen: kitchenCatIcon,
    plastic: plasticCatIcon,
}

const assets = {
    logo1,
    logo2,
    logo3,
    catSlideIcons,
    carouselImgs,
    catImgs,
};

export default assets;