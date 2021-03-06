/// <reference path="../References.d.ts"/>
import * as React from 'react';

interface Props {
	hidden?: boolean;
	label: string;
	value: string;
	onChange: (val: string) => void;
}

const css = {
	label: {
		display: 'inline-block',
	} as React.CSSProperties,
};

export default class PageSelect extends React.Component<Props, {}> {
	render(): JSX.Element {
		return <div hidden={this.props.hidden}>
			<label className="pt-label" style={css.label}>
				{this.props.label}
				<div className="pt-select">
					<select
						value={this.props.value || ''}
						onChange={(evt): void => {
							this.props.onChange(evt.target.value);
						}}
					>
						{this.props.children}
					</select>
				</div>
			</label>
		</div>;
	}
}
