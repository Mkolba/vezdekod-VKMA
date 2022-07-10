import React from 'react';

import bridge from "@vkontakte/vk-bridge";

import {
    Button,
    Group,
    Card,
    Tappable,
    Link,
    Spinner,
    Div,
    Panel,
    PanelHeader,
    Placeholder,
    PullToRefresh,
    PanelHeaderButton,
    ActionSheet,
    ActionSheetItem,
    PanelHeaderBack,
    Textarea, FormLayout, FormItem, Select, CustomSelect, Snackbar, CellButton
} from '@vkontakte/vkui';

import {
    Icon28AttachOutline, Icon56GalleryOutline, Icon20PalleteOutline
} from "@vkontakte/icons";

import apiCall from "../../api";


export default class ProfileSettingsPanel extends React.Component {

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
        apiCall('profile.setPrivacy', {mode: e.target.value, type: type}).then(resp => {
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

    goToWhitelist = (type) => {
        this.props.setGlobalState({privacyType: type});
        this.props.go('profile_whitelist');
    }

    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;
        const isDesktop = window.innerWidth > 768;

        let privacy = globState.userSettings.privacy

        const optionsCreation = [
            {
                label: 'Всем',
                value: 'all'
            },
            {
                label: 'Людям из списка',
                value: 'whitelist'
            },
            {
                label: 'Никому',
                value: 'nobody'
            },
        ]

        const optionsView = [
            {
                label: 'Все',
                value: 'all'
            },
            {
                label: 'Люди из списка',
                value: 'whitelist'
            },
            {
                label: 'Только я',
                value: 'nobody'
            },
        ]

        return (
            <Panel id={this.props.id}>
                <PanelHeader left={<PanelHeaderBack onClick={goBack}/>}>
                    Настройки приватности
                </PanelHeader>

                <Group>
                    <FormLayout>
                        <FormItem top={'Кому доступно создание автографов'}>
                            <CustomSelect value={privacy.creation.available_for} options={optionsCreation} onChange={e => this.onSettingsChange('creation', e)}/>
                        </FormItem>
                    </FormLayout>

                    {
                        privacy.creation.available_for === 'whitelist' &&
                        <CellButton onClick={_ => this.goToWhitelist('creation')}>
                            Изменить список пользователей
                        </CellButton>
                    }

                    <FormLayout>
                        <FormItem top={'Кто может смотреть мои автографы'}>
                            <CustomSelect value={privacy.view.available_for} options={optionsView} onChange={e => this.onSettingsChange('view', e)}/>
                        </FormItem>
                    </FormLayout>

                    {
                        privacy.view.available_for === 'whitelist' &&
                        <CellButton onClick={_ => this.goToWhitelist('view')}>
                            Изменить список пользователей
                        </CellButton>
                    }
                </Group>

                {this.state.snackbar}
            </Panel>
        )
    }
}
