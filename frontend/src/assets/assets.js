import logo1 from "./vtc_logo1.svg";
import logo2 from "./vtc_logo2.svg";
import logo3 from "./vtc_logo3.svg";

import cleaningItemsImg from "./carouselimgs/cleaning_items_img.png";
import megaSaleImg from "./carouselimgs/mega_sale.png";
import categoriesImg from "./carouselimgs/categories.png";
import stationaryItemsImg from "./carouselimgs/stationary_items_img.png";

import cleaningCatImg from "./cat_imgs/cleaning.jpg";


const carouselImgs = {
    cleaning: cleaningItemsImg,
    mega_sale: megaSaleImg,
    categories: categoriesImg,
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