import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AppBar from '../components/Appbar';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Check';
import styles from '../styles/CreateExpense.module.scss';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputAdornment from '@material-ui/core/InputAdornment';
import { curToSymbol, randomPlaceholder } from '../utils';
import { createExpense } from '../actions';
import Snackbar from '../components/Snackbar';
import LoadingDialog from '../components/LoadingDialog';

class CreateExpense extends Component {

    state = {
        type: 'expense',
        value: 0,
        title: '',
        notes: '',
        loading: false,
        error: {
            name: null,
            msg: null
        }
    }

    handleChange = event => {
        let {name, value} = event.target;
        const {error} = this.state;
        if (error.name === name)
            this.setState({error: {name:null, msg: null}});
        this.setState({[name]: value});
    }


    handleSubmit = async () => {
        const {type, value, title, notes} = this.state;
        if (value <= 0) {
            return this.setState({error: {name: 'value', msg: 'Amount must be greater than 0.'}})
        }

        if (title.length < 3) {
            return this.setState({error: {name: 'title', msg: 'Title must be atleast 3 character long.'}});
        }

        if (title.length > 20) {
            return this.setState({error: {name: 'title', msg: 'Title cannot exceed 20 characters. Please use the notes field.'}});
        }

        this.setState({loading: true});
        const error = await this.props.createExpense({type, value, title, notes});
        if (error) {
            console.log(error);
            let msg = `There was an error creating the ${type}. Please Try again.`;
            if (error) {
                msg = error.error;
            }
            return this.setState({error: {name: 'server', msg}, loading: false});
        }
        this.setState({loading: false});
        this.props.history.push({
            pathname: '/dashboard',
            state: {
                created: type
            }
        });
    }

    render() {
        const {type, value, title, notes, loading, error} = this.state;
        const {user} = this.props;
        return (
            <div className={styles.main}>
                <AppBar title="Create Expense" />
                <Tooltip title="Create">
                    <Fab color="primary" onClick={this.handleSubmit} className="fab success">
                        <AddIcon />
                    </Fab>
                </Tooltip>
                <LoadingDialog open={loading} title={`Creating ${type}`} msg="Please wait"/>
                <Snackbar open={error.name === 'server'} message={error.msg} variant="error" onClose={() => this.setState({error: {name: null, msg: null}})}/>
                <Container className={styles.container}>
                    <form className={styles.form}>
                        <FormControl className={styles.formControl} variant="outlined">
                            <InputLabel>
                                Choose Expense Type
                            </InputLabel>
                            <Select
                            value={type}
                            variant="outlined"
                            input={<OutlinedInput 
                                labelWidth={175} 
                                className={styles.largeInputs}
                                name="type" 
                                id="type" />}
                            onChange={this.handleChange}
                            >
                                <MenuItem value="expense">Expense</MenuItem>
                                <MenuItem value="income">Income</MenuItem>
                            </Select>
                            <FormHelperText></FormHelperText>
                        </FormControl>
                        <FormControl variant="outlined" error={error.name === 'value'} className={styles.formControl}>
                                <InputLabel>
                                    Amount
                                </InputLabel>
                                <OutlinedInput 
                                name="value"
                                startAdornment={<InputAdornment position="start">
                                    <p className={styles.largeInputs}>{curToSymbol(user.currency)}</p>
                                </InputAdornment>}
                                type="number"
                                className={[styles.largeInputs, type === 'expense' ? "neg": "pos"]}
                                labelWidth={70}
                                onChange={this.handleChange}
                                value={value}
                                />
                                <FormHelperText>{error.name === 'value' && error.msg}</FormHelperText>
                        </FormControl>
                        <FormControl variant="outlined" error={error.name === 'title'} className={styles.formControl}>
                                <InputLabel>
                                    Title
                                </InputLabel>
                                <OutlinedInput 
                                name="title"
                                className={styles.inputs}
                                labelWidth={35}
                                placeholder={'Ex. ' + randomPlaceholder(type)}
                                onChange={this.handleChange}
                                value={title}
                                />
                                <FormHelperText>{error.name === 'title' && error.msg}</FormHelperText>
                        </FormControl>
                        <TextField
                            multiline
                            value={notes}
                            onChange={this.handleChange}
                            label="Notes"
                            name="notes"
                            variant="outlined"
                            className={styles.formControl}
                            fullWidth
                            rows="6"
                            placeholder={`Describe the ${type}`}
                        />
                    </form>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = ({user}) => ({user});

export default withRouter(connect(mapStateToProps, {createExpense})(CreateExpense));
