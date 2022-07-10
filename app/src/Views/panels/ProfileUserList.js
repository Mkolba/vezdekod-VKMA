import React from 'react';

import bridge from "@vkontakte/vk-bridge";

import {
    Button,
    Group,
    Alert,
    Panel,
    PanelHeader,
    Placeholder,
    Input,
    PanelHeaderBack,
    List, FormLayout, FormItem, Select, CustomSelect, Snackbar, CellButton, FormStatus, Cell, Avatar
} from '@vkontakte/vkui';

import {
    Icon56UsersOutline, Icon28AddOutline, Icon28CancelOutline
} from "@vkontakte/icons";

import apiCall from "../../api";


class AddUserAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            link: ''
        }
    }

    validateLink = (link) => {
        if (link) {
            let pattern = new RegExp('(?:https?:\\/\\/)?(?:vk\\.com)\\/([\\w.]{2,256})');
            let match = link.match(pattern);
            if (link && match && match.input === match[0]) {
                return match[1];
            }
        }
    }

    render() {
        return (
            <Alert header={'Новый пользователь'} onClose={this.props.onClose}>
                <div style={{marginTop: 20}} className={'AlertInput'}>
                    <FormLayout onSubmit={e=>{e.preventDefault(); if (this.validateLink(this.state.link)) this.props.addUser(this.validateLink(this.state.link))}}>
                        <FormItem top={'Ссылка на страницу ВКонтакте'}>
                            <Input placeholder='https://vk.com/...' value={this.state.name} onChange={e => this.setState({link: e.target.value})}/>
                        </FormItem>
                    </FormLayout>

                    <Button disabled={!this.validateLink(this.state.link)} stretched style={{ marginTop: 6 }} size='l' onClick={() => this.props.addUser(this.validateLink(this.state.link))}>
                        Добавить
                    </Button>
                </div>
            </Alert>
        )
    }
}


export default class ProfileUserListPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snackbar: null
        }
    }

    onSettingsChange = (type, e) => {
        let settings = JSON.parse(JSON.stringify(this.props.globState.userSettings))
        settings.privacy[type]['available_for'] = e.target.value;
        this.props.toggleSpinner(true);
        apiCall('profile.setSettings', {settings: settings}).then(resp => {
            this.props.toggleSpinner(false);
            if (resp.success) {
                this.props.setGlobalState({userSettings: settings})
                this.setState({snackbar:
                        <Snackbar onClose={_ => this.setState({snackbar: null})}>
                            Настройки обновлены
                        </Snackbar>
                })
            } else {
                this.props.openAlert(resp.message, true)
            }
        }).catch(e => {
            console.log(e)
            this.props.toggleSpinner(false);
            this.props.openAlert(null, true)
        })
    }

    openAddUserAlert = () => {
        this.props.showPopout(
            <AddUserAlert addUser={this.addUser}/>
        )
    }

    removeUser = (id) => {
        let settings = JSON.parse(JSON.stringify(this.props.globState.userSettings))
        this.props.toggleSpinner(true);
        apiCall('profile.removeUserFromWhitelist', {user_id: id, type: this.props.globState.privacyType}).then(resp => {
            this.props.toggleSpinner(false);
            if (resp.success) {
                settings.privacy[this.props.globState.privacyType]['allowed'] = settings.privacy[this.props.globState.privacyType]['allowed'].filter(item => item['id'] !== id)
                this.props.setGlobalState({userSettings: settings});
                this.setState({snackbar: (
                        <Snackbar onClose={_ => this.setState({snackbar: null})}>
                            Пользователь удалён из списка
                        </Snackbar>
                    )})
            } else {
                this.setState({snackbar: (
                        <Snackbar onClose={_ => this.setState({snackbar: null})}>
                            {resp.message}
                        </Snackbar>
                    )})
            }
        }).catch(e => {
            console.log(e)
            this.props.toggleSpinner(false);
            this.props.openAlert(null, true)
        })
    }

    addUser = (id) => {
        let settings = JSON.parse(JSON.stringify(this.props.globState.userSettings))
        this.props.toggleSpinner(true);
        apiCall('profile.addUserToWhitelist', {user_id: id, type: this.props.globState.privacyType}).then(resp => {
            this.props.toggleSpinner(false);
            if (resp.success) {
                settings.privacy[this.props.globState.privacyType]['allowed'].push(resp.user)
                this.props.setGlobalState({userSettings: settings});
                this.setState({snackbar: (
                    <Snackbar>{resp.user.first_name} добавлен в список</Snackbar>
                )})
            } else {
                this.setState({snackbar: (
                    <Snackbar>{resp.message}</Snackbar>
                )})
            }
        }).catch(e => {
            console.log(e)
            this.props.toggleSpinner(false);
            this.props.openAlert(null, true)
        })
    }

    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;
        const isDesktop = window.innerWidth > 768;

        let privacy = globState.userSettings.privacy[globState.privacyType]
        let privacyType = globState.privacyType

        return (
            <Panel id={this.props.id}>
                <PanelHeader left={<PanelHeaderBack onClick={goBack}/>}>
                    Настройки приватности
                </PanelHeader>

                <FormLayout>
                    <FormItem>
                        <FormStatus header={'Примечание'}>
                            Пользователям из этого списка будет {privacyType === 'view' ? 'доступен просмотр автографов в вашем профиле' : 'доступно создание автографов в вашем профиле'}
                        </FormStatus>
                    </FormItem>
                </FormLayout>

                <Group>
                    {
                        !privacy.allowed.length ?
                            <Placeholder header={'Абсолютная пустота'} icon={<Icon56UsersOutline width={96} height={96} fill={'var(--accent)'}/>} action={
                                <Button onClick={this.openAddUserAlert}>
                                    Добавить пользователя
                                </Button>
                            }>
                                В этом списке еще никого нет
                            </Placeholder>
                        :
                            <List>
                                <CellButton before={<Icon28AddOutline style={{paddingLeft: 10, paddingRight: 24}}/>} onClick={this.openAddUserAlert}>
                                    Добавить пользователя
                                </CellButton>
                                {privacy.allowed.map(item => (
                                    <Cell key={item['id']} before={<Avatar src={item.photo_200}/>} disabled after={
                                        <Button mode={'tertiary'} onClick={_ => this.removeUser(item['id'])}>
                                            <Icon28CancelOutline fill={'var(--destructive)'}/>
                                        </Button>
                                    }>
                                        {item.first_name} {item.last_name}
                                    </Cell>
                                ))}
                            </List>
                    }
                </Group>

                {this.state.snackbar}
            </Panel>
        )
    }
}
