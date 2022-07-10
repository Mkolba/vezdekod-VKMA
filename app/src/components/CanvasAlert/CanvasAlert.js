import React from 'react';
import { Paintable, PaintableRef } from 'paintablejs/react';
import bridge from "@vkontakte/vk-bridge";

import {
    Alert, Button, Div
} from '@vkontakte/vkui';

import {
    Icon28AttachOutline, Icon56GalleryOutline, Icon20PalleteOutline
} from "@vkontakte/icons";

import './CanvasAlert.scss'


export default class CanvasAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '#000000',
            useEraser: false,
            active: true,
        }
        this.ref = React.createRef();
        this.contentRef = React.createRef();
    }

    render() {
        return (
            <Alert onClose={this.props.goBack} header={'Нарисуйте что-нибудь'}>
                <div ref={this.contentRef}>
                    <Paintable
                        width={300}
                        height={200}
                        active={this.state.active}
                        color={this.state.color}
                        useEraser={this.state.useEraser}
                        ref={this.ref}
                        onSave={e => this.props.onSave(e)}
                    />
                    <div className={'CanvasControls'}>
                        <Button onClick={_ => this.setState({useEraser: !this.state.useEraser})} mode={this.state.useEraser ? 'secondary' : 'primary'}>
                            Ластик
                        </Button>
                        <div className={'ColorPicker'}>
                            <input type={'color'} onChange={e => this.setState({color: e.target.value})} value={this.state.color}/>
                        </div>
                    </div>
                    <Button stretched onClick={_ => this.setState({active: false})}>
                        Сохранить
                    </Button>
                </div>
            </Alert>
        )
    }

}
