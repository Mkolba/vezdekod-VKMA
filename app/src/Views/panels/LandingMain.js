import React from 'react';

import bridge from "@vkontakte/vk-bridge";

import {
    Button,
    Panel, PanelHeader, Placeholder
} from '@vkontakte/vkui';

import {
    Icon56GestureOutline, Icon56FireOutline
} from "@vkontakte/icons";


class LandingMainPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.globState.panels.volunteers || {
            snackbar: null,
            buttonSet: false,
        }
    }

    componentDidMount() {
        if (window.location.href.includes('vk_has_profile_button')) {
            this.setState({buttonSet: true});
        }
    }

    componentWillUnmount() {
        this.props.setGlobalState({ panels: {...this.props.globState.panels, volunteers: this.state} });
    }

    enableButton = () => {
        bridge.send('VKWebAppAddToProfile', {ttl: 0}).then(resp => {
            this.setState({buttonSet: true});
        }).catch(e => {
            console.log(e)
        })
    }

    disableButton = () => {
        bridge.send('VKWebAppRemoveFromProfile', {ttl: 0}).then(resp => {
            this.setState({buttonSet: false});
        }).catch(e => {
            console.log(e)
        })
    }

    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;
        const isDesktop = window.innerWidth > 768;

        return (
            <Panel id={this.props.id}>
                <PanelHeader>
                    Автографы
                </PanelHeader>

                { !this.state.buttonSet ?
                    <Placeholder stretched icon={<Icon56GestureOutline width={96} height={96} fill={'var(--accent)'}/>} header={'Привет!'} action={
                        <Button size={'m'} onClick={this.enableButton}>Подключить</Button>
                    }>
                        Нажми на кнопку ниже, чтобы подключить приложение к своему профилю ВКонтакте и начать получать автографы
                    </Placeholder>
                    :
                    <Placeholder stretched icon={<Icon56FireOutline width={96} height={96} fill={'#fdcf58'}/>} header={'Огонь!'} action={
                        <Button size={'m'} mode='destructive' onClick={this.disableButton}>Удалить кнопку</Button>
                    }>
                        Всё готово! Для дальнейшей настройки зайди в приложение, используя кнопку в своём профиле
                    </Placeholder>
                }

                {this.state.snackbar}
            </Panel>
        )
    }
}

export default LandingMainPanel;
