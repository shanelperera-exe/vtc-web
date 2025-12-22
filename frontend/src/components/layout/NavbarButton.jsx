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
	border-radius: 8px;
	line-height: 1;

	/* Make buttons slightly smaller on narrow mobile screens */
	@media (max-width: 640px) {
		width: 36px;
		height: 36px;
		border-width: 2px;

		img, svg {
			width: 20px;
			height: 20px;
		}
	}

	&:hover:not(:disabled) {
		background: #000000;
		color: #ffffff;
		border-color: #000000;
	}

	&:active:not(:disabled) {
		background: #0bd964;
		color: #ffffff;
		border-color: #000000;
	}

	/* smooth transitions */
	transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;

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
