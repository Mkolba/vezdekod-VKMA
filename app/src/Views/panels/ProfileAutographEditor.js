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
    Textarea
} from '@vkontakte/vkui';

import {
    Icon28AttachOutline, Icon56GalleryOutline, Icon20PalleteOutline
} from "@vkontakte/icons";

import './ProfileAutographEditor.scss'
import apiCall from "../../api";
import CanvasAlert from "../../components/CanvasAlert/CanvasAlert";


export default class ProfileAutographEditorPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snackbar: null,
            image: null,
            text: ''
        }
    }

    createPost = () => {
        this.props.toggleSpinner(true);
        apiCall('autographs.create', {
            user_id: this.props.globState.selectedUser,
            image: this.state.image,
            text: this.state.text
        }).then(resp => {
            if (resp.success) {
                let globState = this.props.globState.panels
                let autographs = [
                    {...resp.autograph, name: this.props.globState.user.first_name + ' ' + this.props.globState.user.last_name},
                    ...globState.profile_main.autographs
                ];

                this.props.setGlobalState({panels: {
                    ...this.props.globState.panels, profile_main: {...globState.profile_main, autographs: autographs}
                }})

                this.props.toggleSpinner(false);
                this.props.goBack(false, null, true)
            } else {
                this.props.toggleSpinner(false);
                this.props.openAlert(resp.message, true)
            }
        }).catch(e => {
            console.log(e)
            this.props.toggleSpinner(false)
            this.props.openAlert(null, true)
        })
    }

    onAttachClick = () => {
        let input = document.createElement('input');
        input.accept = 'image/png,image/jpeg,image/jpg';
        input.onchange = (e) => this.attach(e.target.files[0]);
        input.type = 'file';
        input.click();
    }

    attach = (image) => {
        let reader  = new FileReader();

        reader.onloadend = () => {
            this.setState({image: reader.result});
        }

        reader.readAsDataURL(image);
    }

    openCanvas = () => {
        this.props.showPopout(<CanvasAlert {...this.props} onSave={e => {
            this.setState({image: e});
            this.props.goBack();
        }}/>)
    }

    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;
        const isDesktop = window.innerWidth > 768;

        return (
            <Panel id={this.props.id}>
                <PanelHeader left={<PanelHeaderBack onClick={goBack}/>}>
                    Новый автограф
                </PanelHeader>

                <Placeholder>
                    <div className={'ImageField' + (!this.state.image ? ' empty' : '')}>
                        {!this.state.image &&
                            <div className={'Wrapper'}>
                                <div className={'Icons'}>
                                    <Tappable onClick={this.onAttachClick}>
                                        <Icon28AttachOutline width={48} height={48}/>
                                    </Tappable>
                                    <Tappable onClick={this.openCanvas}>
                                        <Icon20PalleteOutline width={48} height={48}/>
                                    </Tappable>
                                </div>
                                <div className={'Text'}>
                                    Прикрепите вложение или оставьте это поле пустым
                                </div>
                            </div>
                        }

                        {
                            this.state.image &&
                                <>
                                    <img src={this.state.image} alt={''}/>
                                </>
                        }
                    </div>
                    {
                        this.state.image &&
                            <Button mode={'destructive'} style={{marginTop: 12}} onClick={_ => this.setState({image: null})}>
                                Удалить картинку
                            </Button>
                    }
                    <Textarea placeholder={'Введите текст автографа'} style={{marginTop: 12}} rows={4} grow={false} value={this.state.text} onChange={e => this.setState({text: e.target.value})}/>
                    <Button stretched style={{marginTop: 12}} size={'m'} disabled={!this.state.text.trim() && !this.state.image} onClick={this.createPost}>
                        Опубликовать автограф
                    </Button>
                </Placeholder>

                {this.state.snackbar}
            </Panel>
        )
    }
}
