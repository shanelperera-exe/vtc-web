import React from 'react';
import styled from 'styled-components';

const RadioBtn = ({ checked = false, onChange, name, value, disabled = false, ariaLabel }) => {
	return (
		<StyledWrapper>
			<label className="container" aria-label={ariaLabel}>
				<input
					type="radio"
					checked={checked}
					onChange={onChange}
					name={name}
					value={value}
					disabled={disabled}
				/>
				<div className="radiomark" />
			</label>
		</StyledWrapper>
	);
}

const StyledWrapper = styled.div`
	.container {
		--input-focus: #0bd964;
		--bg-color: #fff;
		--main-color: #323232;
		position: relative;
		cursor: pointer;
		display: inline-block;
	}

	.container input {
		position: absolute;
		opacity: 0;
	}

	.radiomark {
		width: 20px;
		height: 20px;
		position: relative;
		border: 2px solid var(--main-color);
		box-shadow: 3px 3px var(--main-color);
		background-color: var(--bg-color);
		transition: all 0.3s;
	}

	.container input:checked ~ .radiomark {
		background-color: var(--input-focus);
	}

	.radiomark:after {
		content: "";
		width: 8px;
		height: 8px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--bg-color);
		display: none;
	}

	.container input:checked ~ .radiomark:after {
		display: block;
	}

	.container input:focus-visible ~ .radiomark {
		outline: 2px solid var(--input-focus);
		outline-offset: 2px;
	}

	.container input:disabled ~ .radiomark {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export default RadioBtn;

