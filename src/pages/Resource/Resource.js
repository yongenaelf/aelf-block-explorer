/**
 * @file
 * @author huangzongzhe  zhouminghui
 * 233333
 * TODO: Vote && Resource To migrate out of Application
*/

import React, {Component} from 'react';
import {message} from 'antd';
import {aelf} from '../../utils';
import {DEFAUTRPCSERVER, APPNAME} from '../../../config/config';
import DownloadPlugins from '../../components/DownloadPlugins/DownloadPlugins';
import ResourceAElfWallet from './components/ResourceAElfWallet/ResourceAElfWallet';
import NightElfCheck from '../../utils/NightElfCheck';
import getContractAddress from '../../utils/getContractAddress.js';
import checkPermissionRepeat from '../../utils/checkPermissionRepeat';
import ResourceMoneyMarket from './components/ResourceMoneyMarket/ResourceMoneyMarket';
import getLogin from '../../utils/getLogin';
// import ResourceTransacitionDetails from '../../components/ResourceTransacitionDetails/ResourceTransacitionDetails';
import './Resource.less';

const appName = APPNAME;
let nightElf;
export default class Resource extends Component {
    constructor(props) {
        super(props);
        this.informationTimer;
        this.state = {
            currentWallet: null,
            contracts: null,
            tokenContract: null,
            tokenConverterContract: null,
            showDownloadPlugins: false,
            showWallet: false,
            currentBalance: 0,
            currentCpu: 0,
            currentRam: 0,
            currentNet: 0,
            currentSto: 0,
            loading: false,
            nightElf: null
        };
    }

    componentDidMount() {
        let httpProvider = DEFAUTRPCSERVER;
        getContractAddress().then(result => {
            this.setState({
                contracts: result
            });
            if (!result.chainInfo) {
                message.error('The chain has stopped or cannot be connected to the chain. Please check your network or contact us.', 10);
                return;
            }
            aelf.chain.contractAtAsync(result.multiToken, result.wallet, (error, result) => {
                console.log('multiToken', result);
                this.setState({
                    tokenContract: result
                });
            });
            aelf.chain.contractAtAsync(result.tokenConverter, result.wallet, (error, result) => {
                console.log('tokenConverter', result);
                this.setState({
                    tokenConverterContract: result
                });
            });
        });
        NightElfCheck.getInstance().check.then(item => {
            if (item) {
                nightElf = new window.NightElf.AElf({
                    httpProvider: [
                        httpProvider,
                        null,
                        null,
                        null,
                        [{
                            name: 'Accept',
                            value: 'text/plain;v=1.0'
                        }]
                    ],
                    appName // TODO: 这个需要content.js 主动获取 // TODO: 这个需要content.js 主动获取
                });
                if (nightElf) {
                    this.setState({
                        nightElf
                    });
                    nightElf.chain.getChainInformation((error, result) => {
                        if (result) {
                            nightElf.checkPermission({
                                appName,
                                type: 'domain'
                            }, (error, result) => {
                                if (result && result.error === 0) {
                                    this.insertKeypairs(result);
                                }
                            });
                        }
                    });
                }
            }
        }).catch(error => {
            this.setState({
                showDownloadPlugins: true
            });
        });
    }

    insertKeypairs(result) {
        const {nightElf} = this.state;
        const getLoginPayload = {
            appName,
            connectChain: this.connectChain
        };
        if (result && result.error === 0) {
            const {
                permissions
            } = result;
            const payload = {
                appName,
                connectChain: this.connectChain,
                result
            };
            if (permissions.length) {
                // EXPLAIN: Need to redefine this scope
                checkPermissionRepeat(nightElf, payload, this.getNightElfKeypair.bind(this));
            }
            else {
                localStorage.setItem('currentWallet', null);
                getLogin(nightElf, getLoginPayload, result => {
                    if (result && result.error === 0) {
                        const address = JSON.parse(result.detail).address;
                        this.getNightElfKeypair(address);
                        message.success('Login success!!', 3);
                    }
                    else {
                        this.setState({
                            showWallet: false
                        });
                        message.error(result.errorMessage.message, 3);
                    }
                });
            }
        }
        else {
            message.error(result.errorMessage.message, 3);
        }
    }

    componentWillUnmount() {
        this.setState = function () {};
    }

    getNightElfKeypair(address) {
        const {nightElf} = this.state;
        if (address) {
            nightElf.getAddress({
                appName
            }, (error, result) => {
                if (result && result.error === 0) {
                    const addressList = result.addressList || [];
                    if (!addressList.length) {
                        this.setState({
                            showWallet: false
                        });
                        return;
                    }
                    let currentWallet = null;
                    addressList.map((item, index) => {
                        if (address === item.address) {
                            currentWallet = item;
                        }
                    });
                    localStorage.setItem('currentWallet', JSON.stringify(currentWallet));
                    this.setState({
                        currentWallet,
                        showWallet: true
                    });
                }
            });
        }
    }

    getCurrentBalance(value) {
        this.setState({
            currentBalance: value
        });
    }

    getCurrentCpu(value) {
        this.setState({
            currentCpu: value
        });
    }

    getCurrentRam(value) {
        this.setState({
            currentRam: value
        });
    }

    getCurrentNet(value) {
        this.setState({
            currentNet: value
        });
    }

    getCurrentSto(value) {
        this.setState({
            currentSto: value
        });
    }

    getDownloadPluginsHTML() {
        return <DownloadPlugins />;
    }

    getChangeWallet() {
        this.setState({
            currentWallet: JSON.parse(localStorage.currentWallet)
        });
    }

    onRefresh() {
        let {showWallet, nightElf} = this.state;
        nightElf.getAddress({
            appName
        }, (error, result) => {
            if (result && result.error === 0) {
                if (result.addressList) {
                    let hasWallet = false;
                    result.addressList.map(item => {
                        if (item.address === JSON.parse(localStorage.currentWallet).address) {
                            hasWallet = true;
                        }
                    });
                    if (!hasWallet) {
                        this.setState({
                            loading: false
                        });
                        showWallet = false;
                        return;
                    }
                    showWallet = true;
                }
                else {
                    localStorage.setItem('currentWallet', null);
                    showWallet = false;
                }
                this.setState({
                    showWallet,
                    currentWallet: JSON.parse(localStorage.currentWallet),
                    loading: true
                });
            }
            else {
                message.error(result.errorMessage.message, 3);
            }
        });
    }

    endRefresh() {
        this.setState({
            loading: false
        });
    }

    resourceAElfWalletHtml() {
        const {showWallet, walletInfoList, tokenContract, tokenConverterContract, loading} = this.state;
        if (showWallet) {
            return (
                <ResourceAElfWallet
                    title='AElf Wallet'
                    getChangeWallet={this.getChangeWallet.bind(this)}
                    walletInfoList={walletInfoList}
                    tokenContract={tokenContract}
                    tokenConverterContract={tokenConverterContract}
                    getCurrentBalance={this.getCurrentBalance.bind(this)}
                    getCurrentCpu={this.getCurrentCpu.bind(this)}
                    getCurrentRam={this.getCurrentRam.bind(this)}
                    getCurrentNet={this.getCurrentNet.bind(this)}
                    getCurrentSto={this.getCurrentSto.bind(this)}
                    onRefresh={this.onRefresh.bind(this)}
                    endRefresh={this.endRefresh.bind(this)}
                    loading={loading}
                />
            );
        }
    }
    render() {
        const {showDownloadPlugins, currentWallet, contracts, tokenContract, tokenConverterContract} = this.state;
        const {currentBalance, currentCpu, currentRam, currentNet, currentSto, appName} = this.state;
        let account = {
            balabce: currentBalance,
            CPU: currentCpu,
            RAM: currentRam,
            NET: currentNet,
            STO: currentSto
        };
        let downloadPlugins = null;
        if (showDownloadPlugins) {
            downloadPlugins = this.getDownloadPluginsHTML();
        }
        const resourceAElfWalletHtml = this.resourceAElfWalletHtml();
        return (
            <div className="resource-body">
                {downloadPlugins}
                {resourceAElfWalletHtml}
                <div className='resource-money-market'>
                    <ResourceMoneyMarket
                        currentWallet={currentWallet}
                        contracts={contracts}
                        tokenContract={tokenContract}
                        tokenConverterContract={tokenConverterContract}
                        account={account}
                        onRefresh={this.onRefresh.bind(this)}
                        endRefresh={this.endRefresh.bind(this)}
                        nightElf={nightElf}
                        appName={appName}
                    />
                </div>
            </div>
        );
    }
}
