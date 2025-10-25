import React from 'react'
import styled from 'styled-components'

const ButtonBase = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	background: white;
	border: 3px solid #0a0a0a;
	padding: 0;
	margin: 0;
	color: #111827; /* tailwind gray-800 */
	cursor: pointer;
	-webkit-appearance: button;
	appearance: button;
	outline: none;
	line-height: 1;

	&:hover:not(:disabled) {
		background: #37df80ff;
		color: black;
		border-color: black;
	}

	&:active:not(:disabled) {
		background: #0bd964;
		color: #ffffff;
		border-color: black;
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
