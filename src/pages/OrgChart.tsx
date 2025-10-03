import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
import { listAllEmployeesForOrg } from '@/features/auth/employees/api';
import { EMPLOYEE_ROLES } from '@/types/employee';
import type { Employee } from '@/types/employee';

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

// Custom Node Component
const EmployeeNode = ({ data }: { data: Employee }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-xl shadow-custom-md hover:shadow-custom-lg transition-all duration-200 hover:scale-105"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <div className={`h-2 w-full rounded-t-xl ${getRoleColor(data.role || '')}`} />
      <div className="p-3">
        <div className="font-semibold text-sm text-card-foreground truncate">
          {data.name} {data.surname}
        </div>
        <div className="text-xs text-muted-foreground truncate mb-1">
          {data.role}
        </div>
        <div className="text-xs text-muted-foreground/70">
          #{data.employeeNumber}
        </div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  employee: EmployeeNode,
};

// Layout function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
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
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  // Build graph structure
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
    
    if (selectedRole) {
      filteredEmployees = filteredEmployees.filter(emp => emp.role === selectedRole);
    }

    // Create nodes
    const nodes: Node[] = filteredEmployees.map((emp) => ({
      id: emp.employeeNumber || emp.id,
      type: 'employee',
      data: emp,
      position: { x: 0, y: 0 }, // Will be updated by dagre layout
    }));

    // Create edges (manager -> employee)
    const edges: Edge[] = [];
    const processedEdges = new Set<string>();

    filteredEmployees.forEach((emp) => {
      if (emp.manager) {
        const managerEmp = employeeMap.get(emp.manager);
        if (managerEmp && filteredEmployees.includes(managerEmp)) {
          const edgeId = `${emp.manager}-${emp.employeeNumber || emp.id}`;
          if (!processedEdges.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: emp.manager,
              target: emp.employeeNumber || emp.id,
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
            });
            processedEdges.add(edgeId);
          }
        }
      }
    });

    return getLayoutedElements(nodes, edges);
  }, [employees, searchTerm, selectedRole, employeeMap]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedEmployee(node.data as Employee);
    setIsSheetOpen(true);
  }, []);

  const handleViewInEmployees = useCallback(() => {
    if (selectedEmployee) {
      // Navigate to employees page with search prefilled
      window.location.href = `/employees?search=${encodeURIComponent(selectedEmployee.name + ' ' + selectedEmployee.surname)}`;
    }
  }, [selectedEmployee]);

  const handleCopyEmployeeNumber = useCallback(() => {
    if (selectedEmployee?.employeeNumber) {
      navigator.clipboard.writeText(selectedEmployee.employeeNumber);
    }
  }, [selectedEmployee]);

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
                  <SelectItem value="">All Roles</SelectItem>
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
                setSelectedRole('');
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
                    setSelectedRole('');
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
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-gradient-bg"
              >
                <Controls className="bg-card border border-border rounded-lg z-[9998]" />
                <MiniMap 
                  className="bg-card border border-border rounded-lg z-[9998]"
                  nodeColor={(node) => getRoleColor(node.data?.role || '')}
                />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={20} 
                  size={1}
                  color="hsl(var(--muted-foreground) / 0.3)"
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

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleViewInEmployees}
                  className="btn-primary-polished flex-1"
                >
                  View in Employees
                </Button>
                <Button
                  onClick={handleCopyEmployeeNumber}
                  variant="outline"
                  className="btn-outline-polished"
                >
                  Copy Employee #
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}