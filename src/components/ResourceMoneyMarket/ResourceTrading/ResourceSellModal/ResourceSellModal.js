/**
 * @file ResourceBuyModal
 * @author zhouminghui
*/

import React, {PureComponent} from 'react';
import {Row, Col, Spin, message} from 'antd';
import {aelf} from '../../../../utils';
import {resourceAddress} from '../../../../../config/config';
import getEstimatedValueELF from '../../../../utils/getEstimatedValueELF';
import addressOmit from '../../../../utils/addressOmit';
import getStateJudgment from '../../../../utils/getStateJudgment';
import getFees from '../../../../utils/getFees';
import './ResourceSellModal.less';
import getMenuName from '../../../../utils/getMenuName';

export default class ResourceSellModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            menuIndex: this.props.menuIndex,
            currentWallet: this.props.currentWallet,
            sellNum: this.props.sellNum,
            resourceContract: this.props.resourceContract,
            serviceCharge: 0,
            menuName: this.props.menuName,
            loading: false,
            ELFValue: null,
            nightElf: this.props.nightElf
        };
    }

    componentDidMount() {
        const {sellNum, menuIndex, resourceContract} = this.state;
        let menuName = getMenuName(menuIndex);
        getEstimatedValueELF(menuName, sellNum, resourceContract, 'Sell').then(result => {
            let ELFValue = Math.abs(Math.ceil(result));
            this.setState({
                ELFValue,
                menuName,
                serviceCharge: getFees(ELFValue) + 1
            });
        });
    }

    getSellRes() {
        const {currentWallet, nightElf} = this.state;
        this.props.maskClosable();
        const wallet = {
            address: currentWallet.address
        };
        this.setState({
            loading: true
        });
        nightElf.chain.contractAtAsync(
            resourceAddress,
            wallet,
            (err, result) => {
                if (result) {
                    this.requestSell(result);
                }
            }
        );
    }

    requestSell(result) {
        const {menuName, sellNum} = this.state;
        result.SellResource(menuName, sellNum, (error, result) => {
            if (result) {
                setTimeout(() => {
                    aelf.chain.getTxResult(result.hash, (error, result) => {
                        getStateJudgment(result.result.tx_status, result.result.tx_info.TxId);
                        this.props.onRefresh();
                        this.setState({
                            loading: false
                        });
                        this.props.handleCancel();
                        this.props.unMaskClosable();
                    });
                }, 4000);
            }
            else {
                message.error('Purchase failure', 5);
            }
        });
    }

    render() {
        const {serviceCharge, menuName, currentWallet, sellNum, ELFValue} = this.state;
        return (
            <div className='modal'>
                <Spin
                    size='large'
                    spinning={this.state.loading}
                >
                    <Row className='display-box'>
                        <Col span={8} style={{color: '#c8c7c7'}}>Address</Col>
                        <Col span={16}>{addressOmit(currentWallet.address)}</Col>
                    </Row>
                    <Row className='display-box'>
                        <Col span={8} style={{color: '#c8c7c7'}}>Sell {menuName} Quantity</Col>
                        <Col span={16}>{sellNum}</Col>
                    </Row>
                    <Row className='display-box'>
                        <Col span={8} style={{color: '#c8c7c7'}}>ELF</Col>
                        <Col span={16}>{ELFValue}</Col>
                    </Row>
                    <div className='service-charge'>
                        *Service Charge: {serviceCharge} ELF
                    </div>
                    <div
                        className='modal-button'
                        style={{background: '#cc2828'}}
                        onClick={this.getSellRes.bind(this)}
                    >
                        Sell
                    </div>
                    <div className='modal-tip'>
                        * To avoid price fluctuations leading to transaction failure, please
                        complete the transaction within 30 seconds.
                    </div>
                </Spin>
            </div>
        );
    }
}