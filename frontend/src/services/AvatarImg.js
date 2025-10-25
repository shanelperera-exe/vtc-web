import React from 'react';

export function getAvatarImg(seed, { style = 'notionists', format = 'svg', params = {} } = {}) {
	const safeSeed = encodeURIComponent(String(seed || 'user'));
	const base = `https://api.dicebear.com/9.x/${style}/${format}`;
	const qs = new URLSearchParams(params).toString();
	return qs ? `${base}?seed=${safeSeed}&${qs}` : `${base}?seed=${safeSeed}`;
}

// Optional React component convenience wrapper (avoid JSX so file can remain .js)
export const AvatarImg = ({ seed, style = 'notionists', className = '', alt = '', ...rest }) => {
	const src = getAvatarImg(seed, { style });
	return React.createElement('img', { alt: alt || `Avatar for ${seed}`, src, className, ...rest });
};

export default getAvatarImg;
