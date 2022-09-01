/**
 * @file Search.js
 * @author huangzongzhe
 */
import React, { PureComponent } from "react";
import AElf from "aelf-sdk";
import { withRouter } from "../../routes/utils";
import { isAElfAddress, get } from "../../utils";
import { Input, message } from "antd";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import IconFont from '../../components/IconFont'

import {
    get
} from '../../utils';

import './search.styles.less';

class Search extends PureComponent {
  state = {
    content: "",
  };

  emitEmpty = () => {
    this.userNameInput.focus();
    this.setState({
      content: "",
    });
  };

  onChangeUserName = (e) => {
    this.setState({
      content: e.target.value,
    });
  };

  SEARCHRULES = {
    address: (value, navigate) => {
      this.setState({
        content: ''
      });
      navigate(`/address/${value}`);
    },
    transaction: async (value, navigate) => {
      const getTxsOption = {
        limit: 1,
        page: 0,
        block_hash: value,
      };

      const blockInfo = await get('/block/transactions', getTxsOption);
      const isBlock = blockInfo.transactions && blockInfo.transactions.length;
      this.setState({
        content: ''
      });
      if (isBlock) {
        navigate(`/block/${value}`);
      }
      else {
        navigate(`/tx/${value}`);
      }
    },
    blockHeight: (value, navigate) => {
      let number = parseInt(value, 10);
      if (number == value) {
        this.setState({
          content: ''
        });
        navigate(`/block/${value}`);
        return true;
      }
      return false
    }
  }

  handleSearch = (e) => {
    let value = (e.target && e.target.value) || e.searchValue || "";
    value = value.trim();
    if (!value.trim()) {
      return;
    }

    if (value.indexOf("_") > 0) {
      value = value.split("_")[1];
    }

    // AElf.utils;
    // value = ;

    const { length } = value;
    const isTxid = [64];

        // address.length === 38/66 && address.match(/^0x/)
        // search
        // 0. 0x
        // 1. transaction 66
        // 2. block   66
        // 3. address length=38
        if (`${value}`.startsWith('-')) {
            (location.href = '/search-invalid/' + (e.target && e.target.value || e.searchValue))
            return;
        }
        if (+value === 0) {
            (location.href = '/search-invalid/' + (e.target && e.target.value || e.searchValue))
            return;
        }

        if (isAElfAddress(value)) {
            const address = AElf.utils.encodeAddressRep(AElf.utils.decodeAddressRep(value));
            this.SEARCHRULES.address(address, this.props.history);
        }
        else if (isTxid.includes(length)) {
            this.SEARCHRULES.transaction(value, this.props.history);
        }
        else {
            this.SEARCHRULES.blockHeight(value, this.props.history)
                || (location.href = '/search-invalid/' + (e.target && e.target.value || e.searchValue));
        }
    };

  render() {
    const { content } = this.state;
    return (
      <div className="search-container">
        <Input
          className="header-search"
          placeholder="Search by Address / Txn Hash..."
          value={content}
          onChange={this.onChangeUserName}
          ref={node => (this.userNameInput = node)}
          onPressEnter={this.handleSearch}
        />
        <span
          className="search-icon-container"
          onClick={() => this.handleSearch({
            searchValue: this.state.content
          })}
        >
          <IconFont type="Search" />
        </span>
      </div>
    );
  }
}

export default withRouter(Search);
