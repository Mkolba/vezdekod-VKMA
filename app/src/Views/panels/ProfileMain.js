import React from 'react';
import {toBlob, toPng} from 'html-to-image';
import bridge from "@vkontakte/vk-bridge";

import {
    Button, Group, Card, Tappable, Link, Spinner, Div,
    Panel, PanelHeader, Placeholder, PullToRefresh, PanelHeaderButton, ActionSheet, ActionSheetItem
} from '@vkontakte/vkui';

import {
    Icon28SettingsOutline,
    Icon56GhostOutline,
    Icon28AddOutline, Icon28StoryOutline, Icon28DeleteOutlineAndroid
} from "@vkontakte/icons";

import AutographCard from "../../components/AutographCard/AutographCard";
import apiCall from "../../api";


class ProfileMainPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.globState.panels.profile_main || {
            snackbar: null,
            isFetching: true,
            autographs: [],
            username: '',
            can_create: false,
            can_view: true
        }
    }

    componentWillUnmount() {
        this.props.setGlobalState({ panels: {...this.props.globState.panels, profile_main: this.state} });
    }

    componentDidMount() {
        if (this.state.isFetching) {
            this.requestProfile();
        }
    }

    requestProfile = () => {
        this.setState({isFetching: true});
        apiCall('profile.get', {user_id: this.props.globState.selectedUser}).then((resp) => {
            if (resp.success) {
                this.setState({...resp, isFetching: false})
                this.props.setGlobalState({userSettings: resp.settings})
            } else {
                this.setState({isFetching: false})
                this.props.openAlert(resp.message, true)
            }
        }).catch(e => {
            this.setState({isFetching: false})
            this.props.openAlert(null, true);
        })
    }

    openActionSheet = (autographId) => {
        this.props.showPopout(
            <ActionSheet onClose={() => this.props.showPopout(null)} iosCloseItem={
                <ActionSheetItem autoclose mode="cancel">
                    Отменить
                </ActionSheetItem>
            }>
                <ActionSheetItem autoclose before={<Icon28StoryOutline/>} onClick={_=>this.share(autographId)}>
                    Поделиться в истории
                </ActionSheetItem>
                <ActionSheetItem mode={'destructive'} autoclose before={<Icon28DeleteOutlineAndroid/>} onClick={_=>this.removePost(autographId)}>
                    Удалить
                </ActionSheetItem>
            </ActionSheet>
        )
    }

    removePost = (id) => {
        this.props.toggleSpinner(true);
        apiCall('autographs.remove', {autograph_id: id}).then(resp => {
            this.props.toggleSpinner(false);
            if (resp.success) {
                this.setState({autographs: this.state.autographs.filter(item => item.id !== id)})
            } else {
                this.props.openAlert(resp.message, true);
            }
        }).catch(e => {
            console.log(e);
            this.props.toggleSpinner(false);
            this.props.openAlert(null, true);
        })
    }

    share = (autographId) => {
        let elem = document.getElementById('autograph-' + autographId);
        console.log(elem)
        toPng(elem).then(url => {
            bridge.send("VKWebAppShowStoryBox", {
                "background_type" : "image", "url" : "https://sun9-65.userapi.com/c850136/v850136098/1b77eb/0YK6suXkY24.jpg",
                stickers: [{sticker_type: 'renderable', sticker: {content_type: 'image', blob: url}}]
            });
        });
    }

    openAutographEditor = () => {
        this.props.go('profile_editor')
    }

    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;
        const isDesktop = window.innerWidth > 768;
        let isOwnProfile = this.props.globState.user.id === this.props.globState.selectedUser;

        return (
            <Panel id={this.props.id}>
                <PanelHeader left={
                    (!this.state.isFetching && isOwnProfile) ?
                        <PanelHeaderButton onClick={_ => go('profile_settings')}>
                            <Icon28SettingsOutline/>
                        </PanelHeaderButton>
                    : this.state.can_create &&
                        <PanelHeaderButton onClick={this.openAutographEditor}>
                            <Icon28AddOutline/>
                        </PanelHeaderButton>
                }>
                    {isOwnProfile ? 'Мои автографы' : `Автографы ${this.state.username}`}
                </PanelHeader>

                <PullToRefresh isFetching={this.state.isFetching} onRefresh={this.requestProfile}>
                    <Group>
                        {
                            (this.state.isFetching && !this.state.autographs.length) ?
                                <Placeholder stretched icon={<Spinner size={'l'}/>}/>
                            : !this.state.autographs.length ?
                                isOwnProfile ?
                                    <Placeholder stretched icon={<Icon56GhostOutline width={96} height={96} fill={'var(--accent)'}/>} header={'Абсолютная пустота'}>
                                        Пока никто не оставил вам автограф
                                    </Placeholder>
                                :
                                    <Placeholder stretched icon={<Icon56GhostOutline width={96} height={96} fill={'var(--accent)'}/>} header={'Абсолютная пустота'} action={
                                        this.state.can_create && <Button onClick={this.openAutographEditor}>Оставить автограф</Button>
                                    }>
                                        У {this.state.username} еще нет автографов
                                    </Placeholder>
                            :
                                <Div className={'CardsContainer'}>
                                    {
                                        this.state.autographs.map(item => {
                                            return <AutographCard {...item} key={item['id']} onClick={() => isOwnProfile ? this.openActionSheet(item['id']) : {}} disabled={!isOwnProfile} id={'autograph-' + item['id']}/>
                                        })
                                    }
                                </Div>
                        }
                    </Group>
                </PullToRefresh>

                {this.state.snackbar}
            </Panel>
        )
    }
}

export default ProfileMainPanel;
