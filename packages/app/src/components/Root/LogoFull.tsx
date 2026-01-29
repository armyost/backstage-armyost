import { makeStyles } from '@material-ui/core';
import logo from './logo.png';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 30,
  },
  path: {
    fill: '#7df3e1',
  },
});
const LogoFull = () => {
  const classes = useStyles();

  return (
    <img src={logo} alt="Logo" className={classes.svg} />
  );
};

export default LogoFull;
