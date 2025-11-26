import { Grid } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * ResponsiveGrid component provides consistent responsive grid layouts
 * with staggered animations
 */
const ResponsiveGrid = ({
  children,
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3 },
  animate = true,
  staggerDelay = 0.1,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  if (!animate) {
    return (
      <Grid container spacing={spacing} {...props}>
        {children}
      </Grid>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={spacing} {...props}>
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <Grid
              item
              key={index}
              xs={columns.xs}
              sm={columns.sm}
              md={columns.md}
              lg={columns.lg}
              xl={columns.xl}
            >
              <motion.div variants={itemVariants}>
                {child}
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid
            item
            xs={columns.xs}
            sm={columns.sm}
            md={columns.md}
            lg={columns.lg}
            xl={columns.xl}
          >
            <motion.div variants={itemVariants}>
              {children}
            </motion.div>
          </Grid>
        )}
      </Grid>
    </motion.div>
  );
};

export default ResponsiveGrid;
