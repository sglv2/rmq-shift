
import React, { Component } from 'react'
import Select from 'react-select'
import axios from 'axios'
import Navbar from './Navbar';
import './page.css';

export default class FetchPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectOptions: [],
      queueName: '',
      quantity: 1,
      message: '',
      response: ''
    }
  }

  async getOptions() {
    const res = await axios.get('http://localhost:8080/queue-list')
    const data = res.data

    const options = data.map(d => ({
      "value": d.name,
      "label": d.name
    }))

    let attributes = {}
    console.log(data)
    for (let k in Object.keys(data)) {
      console.log(`${data[k]['name']} ${data[k]['durable']}`)
      attributes[data[k]['name']] = {}
      attributes[data[k]['name']]['durable'] = data[k]['durable']
    }

    this.setState({ selectOptions: options })
    this.setState({ queueAttributes: attributes })

  }

  getTimestamp(){
    let now = new Date();
    return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  }

  handleQueueChange(e) {
    console.log(e)
    this.setState({ queueName: e.label })
  }

  handleQuantityChange(e) {
    console.log(e)
    this.setState({ quantity: e.target.value })
  }

  handleButtonClick(e) {
    console.log(e)
    let config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
    console.log(this.state.message)
    let formData = new FormData();
    try {
      formData.append('count', this.state.quantity)
      formData.append('queueName', this.state.queueName)
      formData.append('durable', this.state.queueAttributes[this.state.queueName]['durable'])
      axios.post('http://localhost:8080/get-messages', formData, config)
        .then(response => {
          this.setState({ response: `successfully retrieved messages at ${this.getTimestamp()}` })
          return response.data;
        }).catch(error => {
          this.setState({ response: `error "${error}" at ${this.getTimestamp()}` })
          return error;
        });
    }
    catch (err) {
      console.log(err)
      this.setState({ response: `error "${err}" at ${this.getTimestamp()}` })
    }
  }

  componentDidMount() {
    this.getOptions()
  }

  render() {
    console.log(this.state.selectOptions)
    return (
      <div>
        <div>
          <Navbar />
        </div>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <div style={{ left: '0vmin', top: '0vmin', backgroundColor: '#99ccff', fontSize: 'calc(10px + 1vmin)' }}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <p className="regular-text">Queue</p>
                  </td>
                  <td>
                    <div style={{ width: "50vmin" }}>
                      <Select
                        className="select"
                        id="queue"
                        options={this.state.selectOptions}
                        onChange={this.handleQueueChange.bind(this)}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '2vmin' }}></div>
                  </td>
                  <td>
                    <label for="quantity" className="numeric-input">Number of messages: </label>
                    <input type="number" className="numeric-input"
                      id="quantity"
                      name="quantity"
                      min="1" max="100"
                      placeholder="1"
                      onChange={this.handleQuantityChange.bind(this)}>
                    </input>
                  </td>
                  <td>
                    <div style={{ width: '2vmin' }}></div>
                  </td>
                  <td>
                    <button className="orange-button"
                      onClick={this.handleButtonClick.bind(this)}
                    >Retrieve messages</button>
                  </td>
                </tr>
                <tr><td>
                  <p>{this.state.response}</p>
                </td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <textarea style={{ height: '100%', width: '100%', left: '0em', top: '0em' }}
              value={this.state.queueName + ' ' + this.state.quantity}
              readOnly
              rows={50}
              cols={100}
            />
          </div>
        </div>
      </div>
    )
  }
}