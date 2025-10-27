import logo1 from "./vtc_logo1.svg";
import logo2 from "./vtc_logo2.svg";
import logo3 from "./vtc_logo3.svg";

import megaSaleImg from "./carouselimgs/mega_sale.png";
import categoriesImg from "./carouselimgs/categories.png";
import newArrivalsImg from "./carouselimgs/new_arrivals.png";
import bundleSaveImg from "./carouselimgs/bundle_save.png";
import whyChooseImg from "./carouselimgs/why_choose.png";
import memberRewardsImg from "./carouselimgs/member_rewards.png";
import cleaningCatImg from "./cat_imgs/cleaning.jpg";
const carouselImgs = {
    // fallback to categories image for missing carousel images
    cleaning: categoriesImg,
    mega_sale: megaSaleImg,
    categories: categoriesImg,
    stationary: categoriesImg,
    new_arrivals: newArrivalsImg,
    bundle_save: bundleSaveImg,
    why_choose: whyChooseImg,
    member_rewards: memberRewardsImg,
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