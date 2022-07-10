import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	withAdaptivity, AppRoot, AdaptivityProvider, ConfigProvider,
	WebviewType, Alert, ScreenSpinner, SplitCol, SplitLayout, Root
} from '@vkontakte/vkui';


import '@vkontakte/vkui/dist/vkui.css';
import apiCall, {url as apiUrl} from './api.js';
import './index.scss'
import LandingView from "./Views/Landing";
import ProfileView from "./Views/Profile";


class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeStory: this.getStartPage(),
			activeModal: null,
			activePanels: {
				'landing': 'landing_main',
				'profile': 'profile_main',
			},
			history: {
				'landing': ['landing_main'],
				'profile': ['profile_main'],
			},
			popout: null,
			globState: {
				isDesktop: window.innerWidth >= 768,
				selectedUser: this.getSelectedUser(),
				modalData: {},
				panels: {},
				user: {},
			},
			backButtonTimeout: null,
		}
	}

	getStartPage = () => {
		if (window.location.href.includes('vk_profile_id')) {
			return 'profile'
		} else {
			return 'landing'
		}
	}

	getSelectedUser = () => {
		if (window.location.href.includes('vk_profile_id')) {
			return Number(window.location.href.match('vk_profile_id=(\\d+)')[1])
		} else {
			return null
		}
	}

	componentDidMount() {
		window.onpopstate = this.goBack;
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig' && data.scheme) {
				this.setScheme(data.scheme);
			}
		})

		bridge.send("VKWebAppGetUserInfo").then(resp => {
			this.setGlobalState({ user: resp })
		});
	}

	blockBackButton = () => {
		if (this.state.backButtonTimeout) {
			clearTimeout(this.state.backButtonTimeout);
			this.setState({ backButtonTimeout: null });
		}

		let timeout = setTimeout(() => {this.setState({ backButtonTimeout: null })}, 400)
		this.setState({ backButtonTimeout: timeout });
	}

	toggleTabbar = (state) => {
		let isLight = this.state.globState.scheme === 'bright_light';
		this.setGlobalState({ showTabbar: state }, () => {
			bridge.send('VKWebAppSetViewSettings', {
				'status_bar_style': isLight ? 'dark' : 'light',
				'action_bar_color': isLight ? '#ffffff' : '#191919',
				'navigation_bar_color': state ? (isLight ? '#ffffff' : '#2c2d2e') : (isLight ? '#ffffff' : '#191919'),
			}).then();
		});
	}

	setScheme = (scheme) => {
		let isLight = ['bright_light', 'client_light'].includes(scheme);
		this.setGlobalState({ scheme: isLight ? 'bright_light' : 'space_gray' });
	}

	showPopout = (popout, closable=true) => {
		let history = this.state.history;
		while (history[this.state.activeStory][history[this.state.activeStory].length - 1].includes('popout')) {
			history[this.state.activeStory].pop();
		}
		let newHistoryObj = `popout.${closable ? "closable" : "nonclosing"}`;
		window.history.pushState({panel: this.state.activePanel + ".popout"}, newHistoryObj);
		history[this.state.activeStory] = [...history[this.state.activeStory], newHistoryObj];
		this.setState({ history, popout });
		this.blockBackButton();
	}

	toggleSpinner = (state) => {
		if (state === true) {
			this.showPopout(<ScreenSpinner/>, false);
		} else {
			this.goBack(true, null, true);
		}
	}

	openModal = (modal, data) => {
		this.blockBackButton();
		let history = this.state.history;
		window.history.pushState({panel: 'modal'}, 'modal');
		history[this.state.activeStory] = [...history[this.state.activeStory], 'modal'];
		this.setState({ globState: {...this.state.globState, modalData: data}, activeModal: modal, history: history });
	}

	go = (panel) => {
		bridge.send('VKWebAppDisableSwipeBack', {}).then();
		let history = this.state.history;
		let activePanels = this.state.activePanels;

		window.history.pushState({panel: panel}, panel);
		activePanels[this.state.activeStory] = panel;
		history[this.state.activeStory] = [...history[this.state.activeStory], panel];

		this.setState({ history, activePanels });
		this.blockBackButton();
	}

	goBack = (closePopout, cb, force) => {

		if (!force && this.state.backButtonTimeout) {
			window.history.pushState({panel: 'block'}, 'block');
			return;
		}

		let history = this.state.history[this.state.activeStory];
		let lastObject = history[history.length - 1];
		let activePanels = this.state.activePanels;

		if (history.length === 1 || lastObject === 'popout.returnable') {
			if (lastObject === 'popout.returnable') {
				this.setState({popout: null})
			}
		} else {
			if (lastObject === 'popout.nonclosing') {
				if (!closePopout) {
					window.history.pushState({panel: this.state.activePanel + ".popout"}, lastObject);
					return;
				} else {
					this.setState({ popout: null });
				}
			} else if (lastObject === 'popout.returnable') {
				this.setState({ popout: null });
			}
			else if (lastObject === 'popout.closable') {
				this.setState({ popout: null });
			} else if (lastObject === 'modal') {
				this.setState({ activeModal: null });
			} else {
				activePanels[this.state.activeStory] = history[history.length - (!history[history.length - (2)].includes('popout') ? 2 : 3)];
			}

			this.setState({ activePanels });
			this.blockBackButton();
			history.pop();
			if (cb) {cb()}
		}
	}

	openAlert = (text, onError, header, cb) => {
		if (!header) {
			header = onError ? 'Что-то пошло не так :C' : 'Действие выполнено'
		}
		if (!text && onError) {
			text = "Нам не удалось достучаться до сервера. Повторите попытку позже."
		}
		this.showPopout(
			<Alert actions={[{title: 'Закрыть', autoclose: true, mode: 'default'}]}
				   onClose={() => this.goBack(true, cb)}
				   header={header}
			>
				{text}
			</Alert>, true
		)
	}

	goToStory = (story, panel=null) => {
		bridge.send('VKWebAppDisableSwipeBack', {}).then();
		if (panel) {
			let history = this.state.history;
			let activePanels = this.state.activePanels;
			if (activePanels[story] !== panel) {
				window.history.pushState({panel: panel}, panel);
				activePanels[story] = panel;
				history[story] = [...history[story], panel];
			}
			this.setState({ history, activeStory: story, activePanels });
			this.blockBackButton();
		} else {
			this.setState({ activeStory: story });
		}
	}

	setGlobalState = (data, cb) => {
		let globalState = {...this.state.globState, ...data};
		this.setState({ globState: globalState }, () => {
			if (cb) {cb()}
		});
		console.log(this.state.globState);
	}


	render() {

		const props = {
			go: this.go, goBack: this.goBack, globState: this.state.globState,
			showPopout: this.showPopout, activeStory: this.state.activeStory, goToStory: this.goToStory,
			activePanels: this.state.activePanels, toggleTabbar: this.toggleTabbar, openModal: this.openModal,
			activeModal: this.state.activeModal, setGlobalState: this.setGlobalState, openAlert: this.openAlert,
			toggleSpinner: this.toggleSpinner, popout: this.state.popout,
			history: this.state.history
		};

		return (
			<ConfigProvider webviewType={WebviewType.VKAPPS}>
				<AdaptivityProvider>
					<AppRoot sizeX='compact'>
						<SplitLayout popout={this.state.popout}>
							<SplitCol spaced={false} width='100%' animate>
								<Root activeView={this.state.activeStory}>
									<LandingView id={'landing'} {...props}/>
									<ProfileView id={'profile'} {...props}/>
								</Root>
							</SplitCol>
						</SplitLayout>
					</AppRoot>
				</AdaptivityProvider>
			</ConfigProvider>
		)
	}
}

export default withAdaptivity(App, {viewWidth: true});
