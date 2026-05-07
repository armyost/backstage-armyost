import { useCallback, useMemo, useState, MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  parseEntityRef,
  Entity,
  CompoundEntityRef,
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import { entityRouteRef, humanizeEntityRef } from '@backstage/plugin-catalog-react';
import {
  useRouteRef,
  useAnalytics,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Chip,
  ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import ZoomOutMap from '@material-ui/icons/ZoomOutMap';
import ToggleButton from '@material-ui/lab/ToggleButton';
import {
  catalogGraphPlugin,
  catalogGraphRouteRef,
  EntityRelationsGraph,
  Direction,
} from '@backstage/plugin-catalog-graph';
import { CustomRenderNode } from './CustomRenderNode';

const useStyles = makeStyles(theme => ({
  content: {
    minHeight: 0,
  },
  container: {
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
  },
  fullHeight: {
    maxHeight: '100%',
    display: 'flex',
    minHeight: 0,
  },
  graphWrapper: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  graph: {
    flex: 1,
    minHeight: 0,
  },
  legend: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: theme.spacing(1),
    '& .icon': {
      verticalAlign: 'bottom',
    },
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    minHeight: '100%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  filterTitle: {
    fontWeight: 600,
  },
  filterSubtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  filterControl: {
    width: '100%',
  },
  filters: {
    display: 'grid',
    gridGap: theme.spacing(1),
    gridAutoRows: 'auto',
    [theme.breakpoints.up('lg')]: {
      display: 'block',
    },
    [theme.breakpoints.only('md')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    [theme.breakpoints.only('sm')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
}));

type LifecycleFilterValue = 'production' | 'experimental' | 'all';

const parseRootEntityRefs = (searchParams: URLSearchParams): CompoundEntityRef[] => {
  const paramValues = [
    ...searchParams.getAll('rootEntityRefs[]'),
    ...searchParams.getAll('rootEntityRefs'),
  ];
  return paramValues.map(ref => parseEntityRef(ref));
};

const CustomCatalogGraphPageComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analytics = useAnalytics();
  const catalogEntityRoute = useRouteRef(entityRouteRef);

  const initialRootEntityNames = useMemo(
    () => parseRootEntityRefs(searchParams),
    [searchParams],
  );

  const [rootEntityNames, setRootEntityNames] = useState<CompoundEntityRef[]>(
    initialRootEntityNames,
  );
  const [showFilters, setShowFilters] = useState(true);
  const [maxDepth, setMaxDepth] = useState(1);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([
    'component',
    'api',
    'resource',
    'feature',
  ]);
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>(Direction.LEFT_RIGHT);
  const [curve] = useState<'curveStepBefore' | 'curveMonotoneX'>(
    'curveMonotoneX',
  );
  const [unidirectional] = useState(false);
  const [mergeRelations] = useState(false);
  const [selectedLifecycles, setSelectedLifecycles] = useState<LifecycleFilterValue[]>([]);

  const subtitle = rootEntityNames.length
    ? rootEntityNames.map(e => humanizeEntityRef(e)).join(', ')
    : undefined;

  const onNodeClick = useCallback(
    (node: { id: string; entity: Entity }, event: MouseEvent<unknown>) => {
      const nodeEntityName = parseEntityRef(node.id);
      if (event.shiftKey) {
        const path = catalogEntityRoute({
          kind: nodeEntityName.kind.toLocaleLowerCase('en-US'),
          namespace: nodeEntityName.namespace.toLocaleLowerCase('en-US'),
          name: nodeEntityName.name,
        });
        analytics.captureEvent(
          'click',
          node.entity.metadata.title ?? humanizeEntityRef(nodeEntityName),
          { attributes: { to: path } },
        );
        navigate(path);
      } else {
        analytics.captureEvent(
          'click',
          node.entity.metadata.title ?? humanizeEntityRef(nodeEntityName),
        );
        setRootEntityNames([nodeEntityName]);
      }
    },
    [analytics, catalogEntityRoute, navigate],
  );

  const kindOptions = useMemo(
    () => ['component', 'api', 'resource', 'feature', 'group', 'system'],
    [],
  );

  const relationOptions = useMemo(
    () => [
      { key: RELATION_PART_OF, label: 'Part of' },
      { key: RELATION_HAS_PART, label: 'Has part' },
      { key: RELATION_API_CONSUMED_BY, label: 'API Consumed by' },
      { key: RELATION_API_PROVIDED_BY, label: 'API Provided by' },
      { key: RELATION_CONSUMES_API, label: 'Consumes API' },
      { key: RELATION_PROVIDES_API, label: 'Provides API' },
      { key: RELATION_DEPENDENCY_OF, label: 'Dependency of' },
      { key: RELATION_DEPENDS_ON, label: 'Depends on' },
    ],
    [],
  );



  const lifecycleEntityFilter = useCallback(
    (entity: Entity) => {
      if (selectedLifecycles.length === 0) {
        return true;
      }
      const lifecycle = entity.metadata?.lifecycle ?? entity.spec?.lifecycle;
      return !!lifecycle && selectedLifecycles.includes(lifecycle as LifecycleFilterValue);
    },
    [selectedLifecycles],
  );

  return (
    <Page themeId="home">
      <Header title="Catalog Graph" subtitle={subtitle} />
      <Content stretch className={classes.content}>
        <ContentHeader
          titleComponent={
            <ToggleButton
              value="show filters"
              selected={showFilters}
              onChange={() => setShowFilters(open => !open)}
            >
              <FilterListIcon /> Filter
            </ToggleButton>
          }
          children={<SupportButton>Use shift-click to open linked entities.</SupportButton>}
        />
        <Grid container alignItems="stretch" className={classes.container}>
          {showFilters && (
            <Grid item xs={12} lg={3}>
              <Paper className={classes.filterPanel} elevation={1}>
                <div className={classes.filterHeader}>
                  <FilterListIcon color="action" />
                  <Typography variant="h6" className={classes.filterTitle}>
                    Graph filters
                  </Typography>
                </div>
                <Typography variant="body2" className={classes.filterSubtitle}>
                  Refine which entities and relations appear in the graph.
                </Typography>
                <FormControl className={classes.filterControl} variant="outlined" size="small">
                  <InputLabel id="lifecycle-filter-label">Lifecycle</InputLabel>
                  <Select
                    labelId="lifecycle-filter-label"
                    label="Lifecycle"
                    multiple
                    value={selectedLifecycles}
                    onChange={e =>
                      setSelectedLifecycles(
                        typeof e.target.value === 'string'
                          ? (e.target.value.split(',') as LifecycleFilterValue[])
                          : (e.target.value as LifecycleFilterValue[]),
                      )
                    }
                    renderValue={selected =>
                      (selected as string[]).length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(selected as string[]).map(value => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </div>
                      ) : (
                        <em>All</em>
                      )
                    }
                  >
                    <MenuItem value="production">
                      <Checkbox checked={selectedLifecycles.indexOf('production') > -1} />
                      <ListItemText primary="Production" />
                    </MenuItem>
                    <MenuItem value="experimental">
                      <Checkbox checked={selectedLifecycles.indexOf('experimental') > -1} />
                      <ListItemText primary="Experimental" />
                    </MenuItem>
                    <MenuItem value="all">
                      <Checkbox checked={selectedLifecycles.indexOf('all') > -1} />
                      <ListItemText primary="All" />
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  className={classes.filterControl}
                  label="Max depth"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={maxDepth}
                  onChange={e => setMaxDepth(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                />
                <FormControl className={classes.filterControl} variant="outlined" size="small">
                  <InputLabel id="kinds-filter-label">Kinds</InputLabel>
                  <Select
                    labelId="kinds-filter-label"
                    label="Kinds"
                    multiple
                    value={selectedKinds}
                    onChange={e =>
                      setSelectedKinds(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : e.target.value,
                      )
                    }
                    renderValue={selected => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(selected as string[]).map(value => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {kindOptions.map(kind => (
                      <MenuItem key={kind} value={kind}>
                        <Checkbox checked={selectedKinds.indexOf(kind) > -1} />
                        <ListItemText primary={kind} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl className={classes.filterControl} variant="outlined" size="small">
                  <InputLabel id="relations-filter-label">Relations</InputLabel>
                  <Select
                    labelId="relations-filter-label"
                    label="Relations"
                    multiple
                    value={selectedRelations}
                    onChange={e =>
                      setSelectedRelations(
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : e.target.value,
                      )
                    }
                    renderValue={selected =>
                      (selected as string[]).length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(selected as string[]).map(value => {
                            const option = relationOptions.find(r => r.key === value);
                            return (
                              <Chip
                                key={value}
                                label={option?.label || value}
                                size="small"
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <em>All</em>
                      )
                    }
                  >
                    {relationOptions.map(relation => (
                      <MenuItem key={relation.key} value={relation.key}>
                        <Checkbox checked={selectedRelations.indexOf(relation.key) > -1} />
                        <ListItemText primary={relation.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl className={classes.filterControl} variant="outlined" size="small">
                  <InputLabel id="direction-filter-label">Direction</InputLabel>
                  <Select
                    labelId="direction-filter-label"
                    label="Direction"
                    value={direction}
                    onChange={e => setDirection(e.target.value as Direction)}
                  >
                    <MenuItem value={Direction.LEFT_RIGHT}>Left to right</MenuItem>
                    <MenuItem value={Direction.TOP_BOTTOM}>Top to bottom</MenuItem>
                    <MenuItem value={Direction.RIGHT_LEFT}>Right to left</MenuItem>
                    <MenuItem value={Direction.BOTTOM_TOP}>Bottom to top</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          )}
          <Grid item xs className={classes.fullHeight}>
            <Paper className={classes.graphWrapper}>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                className={classes.legend}
              >
                <ZoomOutMap className="icon" /> Use pinch & zoom to move around the
                diagram.
              </Typography>
              <EntityRelationsGraph
                rootEntityNames={rootEntityNames}
                maxDepth={maxDepth}
                kinds={selectedKinds}
                relations={
                  selectedRelations.length > 0 ? selectedRelations : undefined
                }
                unidirectional={unidirectional}
                mergeRelations={mergeRelations}
                direction={direction}
                curve={curve}
                onNodeClick={onNodeClick}
                entityFilter={lifecycleEntityFilter}
                renderNode={CustomRenderNode}
                className={classes.graph}
                zoom="enabled"
              />
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const CustomCatalogGraphPage = catalogGraphPlugin.provide(
  createRoutableExtension({
    component: async () => CustomCatalogGraphPageComponent,
    mountPoint: catalogGraphRouteRef,
    name: 'CustomCatalogGraphPage',
  }),
);
