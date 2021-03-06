/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as SettingsTypes from '../types/SettingsTypes';
import PageInput from './PageInput';
import PageInputButton from './PageInputButton';
import PageTextArea from './PageTextArea';
import PageSwitch from './PageSwitch';
import PageInfo from './PageInfo';
import PageSelect from './PageSelect';

interface Props {
	provider: SettingsTypes.ProviderAny;
	onChange: (state: SettingsTypes.ProviderAny) => void;
	onRemove: () => void;
}

interface State {
	addRole: string;
}

const css = {
	card: {
		marginBottom: '5px',
	} as React.CSSProperties,
	role: {
		margin: '9px 5px 0 5px',
		height: '20px',
	} as React.CSSProperties,
};

export default class SettingsProvider extends React.Component<Props, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			addRole: '',
		};
	}

	clone(): SettingsTypes.ProviderAny {
		return {
			...this.props.provider,
		};
	}

	google(): JSX.Element {
		let provider = this.props.provider;

		return <div>
			<PageInput
				label="Domain"
				type="text"
				placeholder="Google domain to match"
				value={provider.domain}
				onChange={(val: string): void => {
					let state = this.clone();
					state.domain = val;
					this.props.onChange(state);
				}}
			/>
		</div>;
	}

	onelogin(): JSX.Element {
		let provider = this.props.provider;

		return <div>
			<PageInput
				label="Issuer URL"
				type="text"
				placeholder="OneLogin issuer URL"
				value={provider.issuer_url}
				onChange={(val: string): void => {
					let state = this.clone();
					state.issuer_url = val;
					this.props.onChange(state);
				}}
			/>
			<PageInput
				label="SAML 2.0 Endpoint (HTTP)"
				type="text"
				placeholder="OneLogin SAML endpoint"
				value={provider.saml_url}
				onChange={(val: string): void => {
					let state = this.clone();
					state.saml_url = val;
					this.props.onChange(state);
				}}
			/>
			<PageTextArea
				label="X.509 Certificate"
				type="text"
				placeholder="OneLogin X.509 certificate"
				rows={6}
				value={provider.saml_cert}
				onChange={(val: string): void => {
					let state = this.clone();
					state.saml_cert = val;
					this.props.onChange(state);
				}}
			/>
		</div>;
	}

	okta(): JSX.Element {
		let provider = this.props.provider;

		return <div>
			<PageInput
				label="Identity Provider Single Sign-On URL"
				type="text"
				placeholder="Okta single sign-on URL"
				value={provider.saml_url}
				onChange={(val: string): void => {
					let state = this.clone();
					state.saml_url = val;
					this.props.onChange(state);
				}}
			/>
			<PageInput
				label="Identity Provider Issuer"
				type="text"
				placeholder="Okta issuer URL"
				value={provider.issuer_url}
				onChange={(val: string): void => {
					let state = this.clone();
					state.issuer_url = val;
					this.props.onChange(state);
				}}
			/>
			<PageTextArea
				label="X.509 Certificate"
				type="text"
				placeholder="Okta X.509 certificate"
				rows={6}
				value={provider.saml_cert}
				onChange={(val: string): void => {
					let state = this.clone();
					state.saml_cert = val;
					this.props.onChange(state);
				}}
			/>
		</div>;
	}

	render(): JSX.Element {
		let provider = this.props.provider;
		let label = '';
		let options: JSX.Element;

		switch (provider.type) {
			case 'google':
				label = 'Google';
				options = this.google();
				break;
			case 'onelogin':
				label = 'OneLogin';
				options = this.onelogin();
				break;
			case 'okta':
				label = 'Okta';
				options = this.okta();
				break;
		}

		let roles: JSX.Element[] = [];
		for (let role of provider.default_roles) {
			roles.push(
				<div
					className="pt-tag pt-tag-removable pt-intent-primary"
					style={css.role}
					key={role}
				>
					{role}
					<button
						className="pt-tag-remove"
						onMouseUp={(): void => {
							let rls = [
								...this.props.provider.default_roles,
							];

							let i = rls.indexOf(role);
							if (i === -1) {
								return;
							}

							rls.splice(i, 1);

							let state = this.clone();
							state.default_roles = rls;
							this.props.onChange(state);
						}}
					/>
				</div>,
			);
		}

		return <div className="pt-card" style={css.card}>
			<h6>{label}</h6>
			<PageInfo
				fields={[
					{
						label: 'ID',
						value: provider.id || 'None',
					},
				]}
			/>
			<PageInput
				label="Label"
				type="text"
				placeholder="Provider label"
				value={provider.label}
				onChange={(val: string): void => {
					let state = this.clone();
					state.label = val;
					this.props.onChange(state);
				}}
			/>
			<label className="pt-label">
				Default Roles
				<div>
					{roles}
				</div>
			</label>
			<PageInputButton
				buttonClass="pt-intent-success pt-icon-add"
				label="Add"
				type="text"
				placeholder="Add default role"
				value={this.state.addRole}
				onChange={(val: string): void => {
					this.setState({
						...this.state,
						addRole: val,
					});
				}}
				onSubmit={(): void => {
					let rls = [
						...this.props.provider.default_roles,
					];

					if (!this.state.addRole) {
						return;
					}

					if (rls.indexOf(this.state.addRole) === -1) {
						rls.push(this.state.addRole);
					}

					rls.sort();

					let state = this.clone();
					state.default_roles = rls;
					this.props.onChange(state);

					this.setState({
						...this.state,
						addRole: '',
					});
				}}
			/>
			<PageSwitch
				label="Create user on authentication"
				checked={provider.auto_create}
				onToggle={(): void => {
					let state = this.clone();
					state.auto_create = !state.auto_create;
					this.props.onChange(state);
				}}
			/>
			<PageSelect
				label="Role Management"
				value={provider.role_management}
				onChange={(val): void => {
					let state = this.clone();
					state.role_management = val;
					this.props.onChange(state);
				}}
			>
				<option value="set_on_insert">Set on insert</option>
				<option value="merge">Merge</option>
				<option value="overwrite">Overwrite</option>
			</PageSelect>
			{options}
			<button
				className="pt-button pt-intent-danger"
				onClick={(): void => {
					this.props.onRemove();
				}}
			>Remove</button>
		</div>;
	}
}
