import logo1 from "./vtc_logo1.svg";
import logo2 from "./vtc_logo2.svg";
import logo3 from "./vtc_logo3.svg";

import cleaningItemsImg from "./carouselimgs/cleaning_items_img.png";
import kitchenItemsImg from "./carouselimgs/kitchen_items_img.png";
import plasticItemsImg from "./carouselimgs/plastic_items_img.png";
import stationaryItemsImg from "./carouselimgs/stationary_items_img.png";

import cleaningCatImg from "./cat_imgs/cleaning.jpg";


const carouselImgs = {
    cleaning: cleaningItemsImg,
    kitchen: kitchenItemsImg,
    plastic: plasticItemsImg,
    stationary: stationaryItemsImg,
};

export const catImgs = {
    cleaning: cleaningCatImg,
};

const assets = {
    logo1,
    logo2,
    logo3,
    carouselImgs,
    catImgs,
};

export default assets;