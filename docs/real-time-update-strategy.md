# Real-Time Update Strategy for Invitation Status

## Overview
This document describes the real-time update strategy for invitation status tracking in the calendar application. The current implementation uses client-side polling via TanStack Query with a 30-second refresh interval.

## Current Implementation: Polling

### Technology Stack
- **Frontend**: React 18.2.0 with TanStack Query 5.12
- **Pattern**: Short-polling with automatic refetch
- **Interval**: 30 seconds (30000ms)

### Implementation Details

#### InvitationStatusPanel Component
```javascript
const { data: summary } = useQuery({
  queryKey: ['invitation-summary', eventId],
  queryFn: () => fetchWithAuth(`/api/v1/events/${eventId}/invitations/summary`),
  refetchInterval: 30000, // Refresh every 30 seconds
  staleTime: 25000,
});

const { data: invitations } = useQuery({
  queryKey: ['event-invitations', eventId],
  queryFn: () => fetchWithAuth(`/api/v1/events/${eventId}/invitations`),
  refetchInterval: 30000,
  staleTime: 25000,
});
```

**Features:**
- Automatic background refresh every 30 seconds
- Manual refresh button for immediate updates
- Refetch on window focus (default TanStack Query behavior)
- Shows last updated timestamp

#### InvitationsPage Component
```javascript
const { data: invitations } = useQuery({
  queryKey: ['user-invitations', filter],
  queryFn: () => {
    const url = filter === 'all' 
      ? '/api/v1/invitations'
      : `/api/v1/invitations?status=${filter.toUpperCase()}`;
    return fetchWithAuth(url);
  },
  refetchInterval: 30000, // Refresh every 30 seconds
  staleTime: 25000,
});
```

**Features:**
- Polls for user's invitations across all events
- Filters maintained during polling (all/pending/accepted/declined)
- Manual refresh button available

### Cache Invalidation Strategy

When users respond to invitations (accept/decline), the mutation immediately invalidates relevant query caches:

```javascript
const mutation = useMutation({
  mutationFn: async () => {
    return fetchWithAuth(`/api/v1/invitations/${invitation.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNote }),
    });
  },
  onSuccess: () => {
    // Invalidate caches to trigger immediate refetch
    queryClient.invalidateQueries({ queryKey: ['invitations'] });
    queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
  },
});
```

**Benefits:**
- Instant local update after user action
- No need to wait for next polling interval
- Ensures UI consistency across all invitation views

## Performance Characteristics

### Network Impact
- **Request Frequency**: Every 30 seconds per active component
- **Payload Size**: 
  - Summary endpoint: ~200 bytes (JSON with counts)
  - Invitations list: ~1-5KB depending on number of invitations
- **Estimated Bandwidth**: 
  - 1 user with organizer panel open: ~10KB/minute
  - 100 concurrent users: ~1MB/minute (~1.4GB/day)

### Server Load
- **Concurrent Users**: Designed for 100+ concurrent users
- **Database Queries**: Simple indexed queries (by eventId, by recipientEmail)
- **Caching**: Repository results cached for 5 minutes (Spring Cache)
- **Expected Load**: 200-400 requests/minute at peak (100 users × 2-4 queries)

### Client Experience
- **Latency**: Real-time updates within 30 seconds (average 15 seconds)
- **UI Performance**: No perceptible lag, queries run in background
- **Battery Impact**: Minimal (polling only when page active)
- **Window Focus**: Queries refetch when user returns to tab

## Comparison: Polling vs WebSocket

| Aspect | Polling (Current) | WebSocket (Future) |
|--------|-------------------|-------------------|
| Implementation | ✅ Simple | ❌ Complex |
| Infrastructure | ✅ HTTP only | ❌ Requires WebSocket server |
| Scalability | ✅ Good (100s of users) | ✅ Excellent (1000s of users) |
| Latency | ⚠️ 15s average (max 30s) | ✅ <1s (near-instant) |
| Bandwidth | ⚠️ Higher (regular polls) | ✅ Lower (push only on change) |
| Client Complexity | ✅ Simple | ⚠️ Connection management |
| Mobile Friendly | ✅ Yes | ⚠️ Connection stability issues |
| Debugging | ✅ Easy (HTTP logs) | ⚠️ Harder (stateful connection) |
| Deployment | ✅ Any HTTP server | ⚠️ Sticky sessions required |

## Future Enhancements

### Phase 1: Adaptive Polling (If Needed)
If network efficiency becomes a concern:
- Increase interval to 60s when page inactive
- Reduce to 10s during active interaction (e.g., after sending invitations)
- Disable polling when battery saver mode detected

### Phase 2: Server-Sent Events (SSE)
If latency becomes critical but full WebSocket is overkill:
- Implement SSE endpoint: `GET /api/v1/invitations/stream`
- Server pushes updates when invitation status changes
- Simpler than WebSocket, unidirectional, HTTP-based
- Better for read-heavy workloads like invitation monitoring

### Phase 3: WebSocket (For Scale)
If concurrent users exceed 500+:
- Implement Spring WebSocket with STOMP protocol
- Subscribe to topics: `/topic/events/{eventId}/invitations`
- Broadcast updates only to subscribed users
- Fallback to polling if WebSocket unavailable
- Requires sticky session load balancing

## Testing Strategy

### Unit Tests
- Mock `refetchInterval` behavior (disable in tests)
- Verify cache invalidation on mutations
- Test manual refresh button triggers

### Integration Tests
- Verify polling updates reflect backend changes
- Test cross-user scenarios (organizer sees recipient response)
- Validate filter persistence during polling

### Performance Tests
- Measure server load with 100 concurrent pollers
- Verify cache hit rates (should be >80% for summary queries)
- Monitor database connection pool usage

## Configuration

### Development
```javascript
// Faster polling for development
refetchInterval: 5000 // 5 seconds
```

### Production
```javascript
// Balanced for user experience and server load
refetchInterval: 30000 // 30 seconds
staleTime: 25000 // Consider data fresh for 25s
```

### Disable Polling (Test Environments)
```javascript
// Override in test setup
refetchInterval: false
```

## Monitoring & Metrics

### Server-Side Metrics
- Track `/api/v1/invitations/*` request rates
- Monitor cache hit/miss ratios
- Alert if request latency exceeds 500ms

### Client-Side Metrics
- Log failed refetch attempts
- Track time-to-update after invitation response
- Monitor query cache size

## Conclusion

The current polling-based approach provides a good balance of:
- ✅ **Simplicity**: Easy to implement, maintain, and debug
- ✅ **Reliability**: Works across all browsers, networks, proxies
- ✅ **Scalability**: Handles 100s of users without issues
- ⚠️ **Latency**: 30-second update window acceptable for invitation tracking

This approach meets the project requirements ("within latency target" for invitation status updates) while avoiding the complexity of real-time WebSocket infrastructure. Future migration to WebSocket can be done incrementally if user scale or latency requirements change.

## References
- [TanStack Query - Polling/Refetching](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching)
- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Server-Sent Events (SSE) Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
