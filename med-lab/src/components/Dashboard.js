import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  People as PeopleIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ title, description, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" startIcon={<AddIcon />}>
        Action
      </Button>
    </CardActions>
  </Card>
);

const ActivityItem = ({ text, icon }) => (
  <ListItem>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={text} />
  </ListItem>
);

function Dashboard() {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to MedLab Pro - Laboratory Management System
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value="0"
            icon={<PeopleIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tests"
            value="0"
            icon={<ScienceIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reports Generated"
            value="0"
            icon={<AssessmentIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tests Today"
            value="0"
            icon={<TimelineIcon color="primary" />}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Common tasks and shortcuts
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Add Patient"
            description="Register new patient"
            icon={<PeopleIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="New Test"
            description="Add test results"
            icon={<ScienceIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Generate Report"
            description="Create patient report"
            icon={<DescriptionIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View Analytics"
            description="Patient statistics"
            icon={<BarChartIcon color="primary" />}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom>
        Recent Activity
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Latest system activities
      </Typography>
      <Paper sx={{ p: 2 }}>
        <List>
          <ActivityItem
            text="System initialized"
            icon={<CheckCircleIcon color="success" />}
          />
          <ActivityItem
            text="Ready for patient management"
            icon={<CheckCircleIcon color="success" />}
          />
          <ActivityItem
            text="Dashboard loaded"
            icon={<CheckCircleIcon color="success" />}
          />
          <ActivityItem
            text="All modules available"
            icon={<CheckCircleIcon color="success" />}
          />
        </List>
      </Paper>
    </Box>
  );
}

export default Dashboard; 