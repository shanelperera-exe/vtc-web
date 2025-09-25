import React from 'react'
import styled from 'styled-components'

const ButtonBase = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	background: white;
	border: 2px solid #0a0a0a;
	box-shadow: 2px 2px 0px #000;
	padding: 0;
	margin: 0;
	color: #111827; /* tailwind gray-800 */
	cursor: pointer;
	transition: transform 0.15s ease, box-shadow 0.15s ease;
	-webkit-appearance: button;
	appearance: button;
	outline: none;
	line-height: 1;

	&:hover:not(:disabled) {
		transform: translate(1px, 1px);
		box-shadow: 1px 1px 0px #000;
	}

	&:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: 0px 0px 0px #000;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	img, svg {
		width: 24px;
		height: 24px;
	}
`

export default function NavbarButton({ as: Component = 'button', children, className = '', ...props }) {
	return (
		<ButtonBase as={Component} className={className} {...props}>
			{children}
		</ButtonBase>
	)
}
