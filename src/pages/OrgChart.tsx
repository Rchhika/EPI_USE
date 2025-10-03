import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  BackgroundVariant,
  Position,
  EdgeTypes,
  ReactFlowInstance,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EmployeeAvatar } from '@/components/ui/avatar';
import { listAllEmployeesForOrg } from '@/features/auth/employees/api';
import { EMPLOYEE_ROLES } from '@/types/employee';
import type { Employee } from '@/types/employee';
import { ExternalLink, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

// Role color mapping
const ROLE_COLORS: Record<string, string> = {
  'CEO': 'bg-gradient-to-r from-purple-500 to-purple-600',
  'CTO': 'bg-gradient-to-r from-blue-500 to-blue-600',
  'CFO': 'bg-gradient-to-r from-green-500 to-green-600',
  'VP': 'bg-gradient-to-r from-orange-500 to-orange-600',
  'Director': 'bg-gradient-to-r from-pink-500 to-pink-600',
  'Manager': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
  'Senior': 'bg-gradient-to-r from-teal-500 to-teal-600',
  'Junior': 'bg-gradient-to-r from-gray-500 to-gray-600',
  'Intern': 'bg-gradient-to-r from-yellow-500 to-yellow-600',
};

const getRoleColor = (role: string) => ROLE_COLORS[role] || 'bg-gradient-to-r from-gray-500 to-gray-600';

// Custom Node Component with collapse functionality
const EmployeeNode = ({ data }: { data: Employee & { level?: number } }) => {
  const isRoot = data.level === 0;
  const isOrphaned = data.level === -1;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border border-border rounded-xl shadow-custom-md hover:shadow-custom-lg transition-all duration-200 hover:scale-105 ${
        isRoot ? 'ring-2 ring-primary/30' : ''
      } ${isOrphaned ? 'opacity-75 border-dashed' : ''}`}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      {/* Source Handle - for outgoing connections (manager to employees) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ 
          background: 'hsl(var(--primary))', 
          width: 8, 
          height: 8,
          border: '2px solid hsl(var(--background))'
        }}
      />
      
      {/* Target Handle - for incoming connections (employee from manager) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ 
          background: 'hsl(var(--primary))', 
          width: 8, 
          height: 8,
          border: '2px solid hsl(var(--background))'
        }}
      />

      <div className={`h-2 w-full rounded-t-xl ${getRoleColor(data.role || '')} ${
        isRoot ? 'h-3' : ''
      }`} />
      {/* Employee information */}
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="flex items-center space-x-3">
          <EmployeeAvatar 
            employee={data} 
            size={40}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-card-foreground truncate">
              {data.name} {data.surname}
              {isRoot && <span className="ml-1 text-xs text-primary">👑</span>}
              {isOrphaned && <span className="ml-1 text-xs text-muted-foreground">⚠️</span>}
            </div>
            <div className="text-xs text-muted-foreground truncate mb-1">
              {data.role}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="text-xs text-muted-foreground/70">
            #{data.employeeNumber}
          </div>
          {data.level !== undefined && data.level >= 0 && (
            <div className="text-xs text-muted-foreground/50 mt-1">
              Level {data.level + 1}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  employee: EmployeeNode,
};

// Enhanced layout function for proper hierarchical tree structure
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Enhanced layout configuration for better tree structure
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 100,        // Increased horizontal spacing between nodes
    ranksep: 180,        // Increased vertical spacing between levels
    align: 'UL',         // Align to upper-left
    acyclicer: 'greedy', // Handle cycles gracefully
    ranker: 'tight-tree', // Use tight-tree ranking for better hierarchy
    edgesep: 20,         // Edge separation
    marginx: 50,         // Horizontal margin
    marginy: 50          // Vertical margin
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: NODE_WIDTH, 
      height: NODE_HEIGHT,
      // Add padding for better visual separation
      padding: 25
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {
      minlen: 2, // Minimum edge length
      weight: 1  // Edge weight for layout
    });
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function OrgChart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const navigate = useNavigate();

  // Fetch all employees for org chart
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees-org-chart'],
    queryFn: listAllEmployeesForOrg,
  });

  // Build employee lookup map
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach(emp => {
      map.set(emp.employeeNumber || emp.id, emp);
    });
    return map;
  }, [employees]);

  // Build graph structure with collapsible subtrees
  const { nodes, edges } = useMemo(() => {
    if (!employees.length) return { nodes: [], edges: [] };

    // Filter employees based on search and role
    let filteredEmployees = employees;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.surname?.toLowerCase().includes(searchLower) ||
        emp.employeeNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedRole && selectedRole !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.role === selectedRole);
    }

    // Helper function to get employee ID (prefer employeeNumber, fallback to id)
    const getEmployeeId = (emp: Employee) => emp.employeeNumber || emp.id;

    // Build hierarchy map
    const hierarchyMap = new Map<string, Employee[]>();
    const employeeMap = new Map<string, Employee>();
    
    filteredEmployees.forEach(emp => {
      const empId = getEmployeeId(emp);
      employeeMap.set(empId, emp);
      
      if (emp.manager) {
        if (!hierarchyMap.has(emp.manager)) {
          hierarchyMap.set(emp.manager, []);
        }
        hierarchyMap.get(emp.manager)!.push(emp);
      }
    });

    // Find root employees (no manager or manager not in filtered list)
    const rootEmployees = filteredEmployees.filter(emp => {
      if (!emp.manager) return true;
      const managerExists = filteredEmployees.some(m => getEmployeeId(m) === emp.manager);
      return !managerExists;
    });

    // Recursive function to build visible nodes and edges
    const buildVisibleHierarchy = (
      employee: Employee, 
      level: number = 0, 
      visibleNodes: Node[] = [], 
      visibleEdges: Edge[] = []
    ): { nodes: Node[], edges: Edge[] } => {
      const empId = getEmployeeId(employee);
      const directReports = hierarchyMap.get(empId) || [];
      
      // Add current employee node
      visibleNodes.push({
        id: empId,
        type: 'employee',
        data: { 
          ...employee, 
          level
        },
        position: { x: 0, y: 0 }, // Will be positioned by dagre
        draggable: false, // Disable node dragging to preserve layout
      });

      // Add direct reports
      directReports.forEach(report => {
          const reportId = getEmployeeId(report);
          
          // Add edge
          visibleEdges.push({
            id: `${empId}-${reportId}`,
            source: empId,
            target: reportId,
            sourceHandle: 'bottom',  // Connect from bottom handle of manager
            targetHandle: 'top',     // Connect to top handle of employee
            type: 'straight', // Use straight lines for clearer tree structure
            animated: false,  // Disable animation for cleaner look
            style: { 
              stroke: level === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', 
              strokeWidth: level === 0 ? 3 : 2,
              strokeDasharray: '0' // Solid lines for all levels
            },
            label: level === 0 ? 'Reports to' : '',
            labelStyle: {
              fontSize: '11px',
              fontWeight: '600',
              fill: 'hsl(var(--muted-foreground))'
            },
            labelBgStyle: {
              fill: 'hsl(var(--card))',
              fillOpacity: 0.9,
              stroke: 'hsl(var(--border))',
              strokeWidth: 1,
              borderRadius: 4
            }
          });

          // Recursively build hierarchy for this report
          buildVisibleHierarchy(report, level + 1, visibleNodes, visibleEdges);
        });

      return { nodes: visibleNodes, edges: visibleEdges };
    };

    // Build hierarchy starting from root employees
    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    if (rootEmployees.length === 0) {
      // Fallback: if no clear roots, treat all as individual nodes
      filteredEmployees.forEach(emp => {
        allNodes.push({
          id: getEmployeeId(emp),
          type: 'employee',
          data: { ...emp, level: -1 },
          position: { x: 0, y: 0 },
          draggable: false,
        });
      });
    } else {
      // Build hierarchy starting from roots
      rootEmployees.forEach(rootEmp => {
        buildVisibleHierarchy(rootEmp, 0, allNodes, allEdges);
      });
    }

    // Handle any remaining employees that weren't processed (orphaned employees)
    const processedIds = new Set(allNodes.map(n => n.id));
    const orphanedEmployees = filteredEmployees.filter(emp => 
      !processedIds.has(getEmployeeId(emp))
    );

    orphanedEmployees.forEach(emp => {
      allNodes.push({
        id: getEmployeeId(emp),
        type: 'employee',
        data: { ...emp, level: -1 }, // Mark as orphaned
        position: { x: 0, y: 0 },
        draggable: false,
      });
    });

    return getLayoutedElements(allNodes, allEdges);
  }, [employees, searchTerm, selectedRole, employeeMap]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
    
    // Fit view after layout changes
    if (reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance.current) {
        setTimeout(() => {
          reactFlowInstance.current?.fitView({ padding: 0.2 });
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    // Initial fit view
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 100);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const data = node.data as Employee;
    
    // Always open details sheet when clicking on any node
    setSelectedEmployee(data);
    setIsSheetOpen(true);
  }, []);

  const handleViewInEmployees = useCallback(() => {
    if (selectedEmployee) {
      // Navigate to employees page with search prefilled with employee's full name
      // Backend now supports combined name search
      const searchQuery = `${selectedEmployee.name} ${selectedEmployee.surname}`;
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [selectedEmployee, navigate]);


  const getManagerName = (managerId: string) => {
    const manager = employeeMap.get(managerId);
    return manager ? `${manager.name} ${manager.surname}` : 'Unknown Manager';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="card-premium">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load organization chart</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          Organization Chart
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Visualize your company's reporting structure and team hierarchy
        </p>
      </div>

      {/* Controls */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Chart Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or employee number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-solid"
              />
            </div>
            <div className="sm:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="z-[9999]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">All Roles</SelectItem>
                  {EMPLOYEE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
              }}
              className="btn-outline-polished"
            >
              Clear Filters
            </Button>
          </div>

          {/* Role Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground mr-2">Role Colors:</span>
            {Object.entries(ROLE_COLORS).map(([role, color]) => (
              <Badge key={role} variant="secondary" className="text-xs">
                <div className={`w-3 h-3 rounded-full ${color} mr-1`} />
                {role}
              </Badge>
            ))}
          </div>

          {/* Hierarchy Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground mr-2">Hierarchy:</span>
            <Badge variant="secondary" className="text-xs">
              <span className="mr-1">👑</span>
              Root Level (CEO/No Manager)
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <span className="mr-1">⚠️</span>
              Orphaned (Manager Missing)
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Level Numbers Show Depth
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="card-premium">
        <CardContent className="p-0">
          {reactFlowNodes.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No employees found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-[600px] w-full">
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onInit={onInit}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ 
                  padding: 0.25,
                  minZoom: 0.3,
                  maxZoom: 1.2
                }}
                className="bg-gradient-bg"
                defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
                minZoom={0.3}
                maxZoom={1.2}
                attributionPosition="bottom-left"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                proOptions={{ hideAttribution: true }}
              >
                <Controls 
                  className="bg-card border border-border rounded-lg z-[9998]" 
                  showInteractive={false}
                />
                <MiniMap 
                  className="bg-card border border-border rounded-lg z-[9998]"
                  nodeColor={(node) => {
                    const data = node.data as Employee & { level?: number };
                    if (data.level === 0) return 'hsl(var(--primary))';
                    if (data.level === -1) return 'hsl(var(--destructive))';
                    return 'hsl(var(--muted-foreground))';
                  }}
                  nodeStrokeWidth={3}
                  nodeBorderRadius={8}
                  maskColor="hsl(var(--background) / 0.8)"
                />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={30} 
                  size={1.5}
                  color="hsl(var(--muted-foreground) / 0.2)"
                />
              </ReactFlow>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="glass-strong">
          <SheetHeader>
            <SheetTitle>Employee Details</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {selectedEmployee.name} {selectedEmployee.surname}
                </h3>
                <Badge className={getRoleColor(selectedEmployee.role || '')}>
                  {selectedEmployee.role}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Employee #{selectedEmployee.employeeNumber}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedEmployee.email}</p>
                </div>
                
                {selectedEmployee.manager && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm">{getManagerName(selectedEmployee.manager)}</p>
                  </div>
                )}

                {selectedEmployee.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-sm">
                      {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleViewInEmployees}
                  className="btn-primary-polished w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View & Edit in Employees Table
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}