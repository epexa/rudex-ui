import React from "react";
import Translate from "react-translate-component";
import Trigger from "react-foundation-apps/src/trigger";
import BaseModal from "../Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import SettingsActions from "actions/SettingsActions";

class WebsocketAddModal extends React.Component {

    constructor() {
        super();

        let protocol = window.location.protocol;
        this.state = {
            protocol: protocol,
            ws: protocol === "https:" ? "wss://" : "ws://",
            type: "remove"
        };
    }

    onInput(e) {
        if (this.state.protocol === "https:") {
            e.target.value = e.target.value.replace("ws://", "wss://")
        }
        if (e.target.value.indexOf("ws://") !== -1 || e.target.value.indexOf("wss://") !== -1) {
            this.setState({ws: e.target.value});
        }
    }

    show(e) {
        console.log("show", e.target.id);
        let target;
        if (e.target.id.indexOf("add") !== -1) {
            target = "add";
        } else if (e.target.id.indexOf("remove") !== -1) {
            target = "remove";
        }
        this.setState({
            type: target
        });
        ZfApi.publish("ws_modal_" + target, "open")
    }

    close() {
        ZfApi.publish("ws_modal_" + this.state.type, "close")
    }

    onAddSubmit(e) {
        e.preventDefault();
        SettingsActions.addWS(this.state.ws);

        this.setState({
            ws: this.state.protocol === "https:" ? "wss://" : "ws://"
        });
        this.close();
    }

    onRemoveSubmit(e) {
        e.preventDefault();
        let removeIndex;
        this.props.apis.forEach((api, index) => {
            if (api.url === this.refs.select.value) {
                removeIndex = index;
            }
        });

        /* Set default if removing currently active API server */
        if (this.props.api === this.props.apis[removeIndex].url) {
            SettingsActions.changeSetting.defer({
                setting: "apiServer",
                value: this.props.apis[0].url
            });
            this.props.changeConnection(this.props.apis[0].url);
        }

        SettingsActions.removeWS(removeIndex);
        this.close();
    }

    _renderAddModal() {
        return (
            <BaseModal id="ws_modal_add" ref="ws_modal_add" overlay={true} overlayClose={false}>
                <div className="grid-content">
                    <Translate component="h3" content="settings.add_ws" />
                    <form onSubmit={this.onAddSubmit.bind(this)} noValidate>
                        <section className="block-list">
                        <ul>
                            <li className="with-dropdown">
                                <input type="text" onChange={this.onInput.bind(this)} value={this.state.ws} />
                            </li>
                        </ul>
                        </section>
                        <div className="button-group">
                            <button type="submit" className={"button"} onClick={this.onAddSubmit.bind(this)}>
                                <Translate content="transfer.confirm" />
                            </button>
                            <Trigger close={"ws_modal_add"}>
                                <div  className=" button"><Translate content="account.perm.cancel" /></div>
                            </Trigger>
                        </div>
                    </form>
                </div>
            </BaseModal>
        )
    }

    _renderRemoveModal() {
        if (!this.props.api) {
            return null;
        }
        let options = this.props.apis.map((entry, index) => {
            if (index > 0) {
                return <option value={entry.url} key={entry.url}>{entry.location || entry.url} {entry.location ? `(${entry.url})` : null}</option>;
            }
        }).filter(a => {
            return !!a;
        });

        return (
            <BaseModal id="ws_modal_remove" ref="ws_modal_remove" overlay={true} overlayClose={false}>
                <div className="grid-content no-overflow">
                    <Translate component="h3" content="settings.remove_ws" />
                    <section className="block-list">
                        <header><Translate component="span" content={"settings.apiServer"} /></header>
                        <ul>
                            <li className="with-dropdown">
                                <select ref="select">
                                    {options}
                                </select>
                            </li>
                        </ul>
                    </section>
                    <form onSubmit={this.onRemoveSubmit.bind(this)} noValidate>

                        <div className="button-group">
                            <button type="submit" className={"button"} onClick={this.onRemoveSubmit.bind(this)}>
                                <Translate content="transfer.confirm" />
                            </button>
                            <Trigger close={"ws_modal_remove"}>
                                <div className="button"><Translate content="account.perm.cancel" /></div>
                            </Trigger>
                        </div>
                    </form>
                </div>
            </BaseModal>
        )
    }

    render() {
        return (
            <div>
                {this._renderAddModal()}
                {this._renderRemoveModal()}
            </div>
        );
    }
}

export default WebsocketAddModal;
